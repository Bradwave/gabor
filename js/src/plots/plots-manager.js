/**
 * Manages plots, sort of...
 * @returns Public APIs.
 */
const plotsManager = new function () {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Number of milliseconds to wait after resizing.
     * @type {Number}
     */
    const waitTime = 200;

    let resizeTimeout;

    const refreshButton = document.getElementById("refresh-all");

    /**
     * Spinning loaders.
     */
    const loaders = [...document.getElementsByName("plot-loader")];

    /**
     * Plot containers.
     */
    const canvases = [...document.getElementsByName("plot")];

    /**
     * Window buttons.
     */
    const windowMoveButtons = [...document.getElementsByName("window-button")];

    /**
     * Reset windows positions button.
     */
    const resetWindowsButton = document.getElementById("reset-window");

    /**
     * Fourier transform button.
     */
    const fourierMoveButton = document.getElementById("fourier-movable");

    /**
     * Reset Fourier transform position button.
     */
    const resetFourierButton = document.getElementById("reset-fourier");

    /**
     * Show or hide processed spectrogram.
     */
    const processedButton = document.getElementById("processed");

    /**
     * Edit the spectrogram.
     */
    const editButton = document.getElementById("edit");

    /**
     * Cut the selected area in the spectrogram.
     */
    const cutButton = document.getElementById("cut");

    /**
    * Selection element div.
    */
    const selectionArea = document.getElementById("selection-area");

    /**
     * Plots.
     */
    let plots = new Map();

    /**
     * True if the window is movable, false otherwise.
     */
    let movableWindows = [true, false];

    /**
     * Sigma of the first window.
     */
    let sigma1 = 0.5;

    /**
     * Sigma of the second window.
     */
    let sigma2 = 1;

    /**
     * True if two windows are used, false otherwise.
     */
    let useTwoWindows = false;

    /**
     * Time scale factor for the plots.
     */
    let timeScale = 20;

    /**
     * Music volume multiplier.
     */
    let volume = 1;

    /**
     * Noise factor
     */
    let noiseFactor = 0.1;

    /**
     * Number of sampled points for the signal and window.
     */
    let signalNumPoints = 1200;

    /**
     * Time sampling rate.
     */
    let timeRate = 5;

    /**
     * Frequency sampling rate.
     */
    let freqRate = 15;

    /**
     * Padding for the Gabor transform plot.
     */
    let padding = .2;

    /**
     * True if the Fourier plot is visible, false otherwise.
     */
    let fourierVisible = { previous: false, current: false };

    /**
     * True if the Fourier transform is movable, false otherwise.
     */
    let fourierMovable = false;

    /**
     * Exponent used to scale the Fourier spectrogram.
     */
    let fourierPower = 4;

    /**
     * Percentage of the canvas width used for the Fourier plot.
     */
    let fourierScale = 0.1;

    /**
     * Fourier frequency sample rate.
     */
    let fourierFreqRate = 15;

    /**
     * Position fo the Fourier transform.
     */
    let fourierPosition = 0;

    /**
     * Denoise factor.
     */
    let denoiseFactor = 0.1;

    /**
    * True if the processed spectrogram is visible, false otherwise.
    */
    let showProcessed = false;

    /**
     * True if the spectrogram can be edited, false otherwise.
     */
    let isEditable = { previous: false, current: false };

    /**
     * Music sheet for the signal.
     */
    let musicSheet = "[a#/1 a1/2:2 a2/1.5:0.5]; [f1/2:1.5 _/1.5 g&1/0.5]";

    /**
     * Signal f(x)
     */
    let signal;

    /**
     * Gabor and Fourier transform controller.
     */
    let analysisController;

    // Creates the plots.
    publicAPIs.createPlots = function () {
        // Window plot
        plots.set(
            'window',
            new windowPlot("window")
        );

        // Window plot
        plots.set(
            'synthesis',
            new synthesisPlot("synthesis")
        );
    }

    /**
     * Updates the plots.
     */
    publicAPIs.update = function () {
        updateInputBoxes();

        musicManager.setTimeScale(timeScale);
        musicManager.setVolume(volume);

        //Signal setup
        try {
            signal = new musicSignal(
                musicManager.fromStringToMusic(musicSheet),
                {
                    N: signalNumPoints,
                    noiseFactor: noiseFactor
                });
        } catch (error) {
            console.log(error);
            signal = new musicSignal(
                musicManager.fromStringToMusic("[a/1:1]"),
                {
                    N: signalNumPoints,
                    noiseFactor: noiseFactor
                });
        }

        // Windows setup
        const g1 = new gaussianWindow(sigma1,
            {
                N: signalNumPoints,
                L: signal.getDuration()
            }
        );
        const g2 = new gaussianWindow(sigma2,
            {
                N: signalNumPoints,
                L: signal.getDuration()
            }
        );

        analysisController = new transformManager(
            signal, g1,
            {
                N: signalNumPoints,
                window2: g2,
                timeRate: timeRate,
                freqRate: freqRate,
                padding: padding,
                useTwoWindows: useTwoWindows,
                denoiseFactor: denoiseFactor,
                isProcessed: showProcessed
            }
        );

        // Signal, window and Gabor transform plots.

        // Window plot
        plots.get('window').update(g1,
            {
                signal: signal,
                N: signalNumPoints,
                useTwoWindows: useTwoWindows,
                window2: g2
            }
        );

        // Gabor transform plot
        plots.set('gabor', new gaborPlot('gabor', analysisController,
            {
                useTwoWindows: useTwoWindows,
                timeRate: timeRate,
                freqRate: freqRate,
                isEditable: isEditable.current,
                selectionArea: selectionArea
            }
        ));

        // Fourier plot
        plots.set('fourier', new fourierPlot('fourier', analysisController,
            {
                freqRate: fourierFreqRate,
                power: fourierPower,
                scale: fourierScale,
                visibility: fourierVisible.current,
                movability: fourierMovable,
                position: fourierPosition,
            }
        ));

        // Synthesis
        plots.get('synthesis').update(analysisController.synthesizeSignal());
    }

    // On window resize
    window.onresize = () => {
        plots.forEach(plot => {
            // Resize the canvas
            plot.clearPlot();
        });

        setLoadingStyle(true);

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setLoadingStyle(false);

            plots.forEach(plot => {
                // Resize the after waiting (for better performances)
                plot.resizeCanvas();
                // Draws the plot
                plot.drawPlot();
            });
        }, waitTime);
    }

    // On window click (get focus)
    window.onclick = (e) => {
        e.target.focus();
        if (e.target.id.localeCompare("canvas-fourier") == 0) {
            canvases[1].classList.add('focused');
            canvases[2].classList.add('focused');
        } else {
            canvases[1].classList.remove('focused');
            canvases[2].classList.remove('focused');
        }
    }

    function setLoadingStyle(isLoading, opacity = 0) {
        if (isLoading) {
            canvases.forEach((canvas, i) => {
                // Hides the canvases
                canvas.style.opacity = (i != 2) ?
                    opacity : (fourierVisible.current ? 0.2 : 0);
                canvas.style.visibility = "hidden";
            });

            loaders.forEach(loader => {
                // Displays the loader while waiting
                loader.style.opacity = 1;
                loader.style.visibility = "visible";
                loader.style.animationPlayState = "running";
            });
        } else {
            canvases.forEach((canvas, i) => {
                // Displays the canvases
                canvas.style.opacity = (i != 2) ?
                    1 : (fourierVisible.current ? 1 : 0);
                canvas.style.visibility = "visible";
            });

            loaders.forEach(loader => {
                // Hides the loader
                loader.style.opacity = 0;
                loader.style.visibility = "hidden";
                loader.style.animationPlayState = "paused";
            });
        }
    }

    /*_______________________________________
    |   Inputs for the plots
    */

    /**
     * Textarea for the music sheet
     */
    let textarea = document.getElementById("music-sheet");

    // Textarea height auto-adjust
    textarea.setAttribute("style",
        "height:" + (textarea.scrollHeight - 20) + "px; overflow-y:hidden;");
    textarea.addEventListener("input", OnInput, false);

    function OnInput() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight - 20) + "px";
    }

    // Sets listeners for textarea
    textarea.onchange = () => {
        const textareaValue = textarea.value.toLowerCase();
        musicSheet = musicManager.getMusicSheet(textareaValue);

        if (typeof musicSheet === 'undefined') {
            musicSheet = textareaValue;
        } else {
            // Change parameters for Bach's toccata
            if (textarea.value == "bach toccata") {
                plotInputs.get('time-scale').value = 2;
                plotInputs.get('volume').value = 2;
                plotInputs.get('noise').value = 0;
                plotInputs.get('sigma-1').value = 0.005;
                plotInputs.get('sigma-2').value = 0.05;
                plotInputs.get('zoom').value = 0.15;
            }

            // Updates the textarea value
            textarea.value = musicSheet;

            // Updates the textarea height
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight - 20 + "px";
        }

        changePlot();
    }

    /**
     * Ids of input boxes for the plots.
     */
    let inputIds = [
        'signal-num-points', 'time-scale', 'volume', 'noise',
        'sigma-1', 'sigma-2',
        't-rate', 'f-rate', 'zoom',
        'fourier-f-rate', 'fourier-power', 'fourier-scale',
        'denoise'
    ];

    /**
     * Input boxes for the plots.
     */
    let plotInputs = new Map();

    // Creates the input map
    inputIds.forEach((id) => {
        plotInputs.set(id, document.getElementById(id));
    });

    // Sets listeners for input boxes
    plotInputs.forEach((input) => {
        input.onchange = () => {
            changePlot();
        }
    });

    /**
     * Updates the input boxes and the respective variables.
     */
    function updateInputBoxes() {
        // Signal
        signalNumPoints = constrain(getInputNumber(plotInputs, 'signal-num-points'), 1, Infinity);
        timeScale = constrain(getInputNumber(plotInputs, 'time-scale'), 0, Infinity);
        volume = constrain(getInputNumber(plotInputs, 'volume'), 0, Infinity);
        noiseFactor = getInputNumber(plotInputs, 'noise');

        // Window
        sigma1 = getInputNumber(plotInputs, 'sigma-1');
        const sigma2Input = plotInputs.get('sigma-2').value;
        if (sigma2Input.localeCompare("no") == 0) {
            useTwoWindows = false;
            // Uncheck the window button (indicating it is movable)
            setWindowButtonState(false);
        } else {
            useTwoWindows = true;
            sigma2 = getInputNumber(plotInputs, 'sigma-2');
            // Check the window button if previously active;
            setWindowButtonState(true);
        }

        // Gabor
        timeRate = constrain(getInputNumber(plotInputs, 't-rate'), 0, Infinity);
        freqRate = constrain(getInputNumber(plotInputs, 'f-rate'), 0, Infinity);
        padding = getInputNumber(plotInputs, 'zoom');

        // Fourier
        fourierScale = constrain(getInputNumber(plotInputs, 'fourier-scale'), 0, 1);
        fourierPower = getInputNumber(plotInputs, 'fourier-power');
        fourierFreqRate = constrain(getInputNumber(plotInputs, 'fourier-f-rate', 0, Infinity));

        // Processing and synthesis
        denoiseFactor = constrain(getInputNumber(plotInputs, 'denoise'), 0, 1);
    }

    /**
     * Update plot when input boxes change.
     */
    function changePlot() {
        setLoadingStyle(true, 0.15);
        setTimeout(function () {
            publicAPIs.update();
            setLoadingStyle(false);
        }, 50);
    }

    windowMoveButtons[0].onclick = () => {
        toggleWindowButton(0, (movableWindows[0] == true) ? false : true);
    }

    windowMoveButtons[1].onclick = () => {
        if (useTwoWindows)
            toggleWindowButton(1, (movableWindows[1] == true) ? false : true);
    }

    /**
     * Check or uncheck the button that indicates a window is movable.
     * @param {Number} index Index of the window.
     * @param {Boolean} movable True if movable, false otherwise.
     */
    const toggleWindowButton = (index, movable) => {
        movableWindows[index] = movable;
        windowMoveButtons[index].style.opacity = movable ? 1 : 0.5;
    }

    const setWindowButtonState = (active) => {
        const movable = movableWindows[1];
        windowMoveButtons[1].style.color = active ? "#0C95C7" : "var(--primary)";
        windowMoveButtons[1].style.opacity = active ? (movable ? 1 : 0.5) : (movable ? 0.5 : 0.2);
    }

    /**
     * Returns if the window corresponding to the index is movable, false otherwise.
     * @param {Number} index Index of the window.
     * @returns True if the window is movable, false otherwise.
     */
    publicAPIs.isWindowMovable = (index) => {
        return movableWindows[index];
    }

    // Listeners for the windows positions reset button
    resetWindowsButton.onclick = () => {
        plots.get("window").resetWindowPositions();
    }

    /** 
     * Input box for the Fourier visibility
     */
    const fourierVisibilityInput = document.getElementById("fourier-visible");

    // Sets listener for the Fourier visibility input box
    fourierVisibilityInput.onchange = () => {
        const fourierVisibility = fourierVisibilityInput.value;
        switch (fourierVisibility) {
            case "yes":
                toggleFourier(true, fourierMovable);
                break;
            case "no":
                toggleFourier(false, fourierMovable);
                break;
            default:
                toggleFourier(false, fourierMovable);
                fourierVisibilityInput.value = "no";
        }

        if (fourierVisible.current) {
            isEditable.previous = isEditable.current;
            toggleEdit(false);
        } else {
            toggleEdit(isEditable.previous);
        }
    }

    /**
     * Shows or hides the Fourier plot.
     * @param {Boolean} visible True if the Fourier plot is visible, false otherwise.
     */
    const toggleFourier = (visible, movable) => {
        fourierVisible.current = visible;
        fourierMovable = movable;

        canvases[2].style.opacity = visible ? 1 : 0;
        canvases[2].style.visibility = visible ? "visible" : "collapse";
        plots.get("fourier").setVisibility(visible);
        plots.get("fourier").setMovability(movable);

        fourierMoveButton.style.color = visible ? "#B01A00" : "var(--primary)";
        fourierMoveButton.style.opacity = visible ? (movable ? 1 : 0.5) : (movable ? 0.5 : 0.2);
    }

    fourierMoveButton.onclick = () => {
        toggleFourier(fourierVisible.current,
            fourierVisible.current ? (fourierMovable ? false : true) : fourierMovable);
    }

    resetFourierButton.onclick = () => {
        plots.get("fourier").resetFourierPosition();
    }

    /**
     * Set the position of the transform transform in the plot.
     * @param {Number} position THe position ∈ [0,1].
     */
    publicAPIs.setFourierPosition = (position) => {
        fourierPosition = position;
    }

    /**
     * Shows or hides the processed spectrogram.
     * @param {Boolean} visible True if the processed spectrogram is visible, false otherwise.
     */
    const toggleProcessed = (visible) => {
        showProcessed = visible;

        processedButton.style.color = visible ? "#B01A00" : "var(--primary)";
        processedButton.style.opacity = visible ? 1 : 0.5;
    }

    processedButton.onclick = () => {
        toggleProcessed(showProcessed ? false : true);

        setTimeout(function () {
            plots.get('gabor').setProcessedVisibility(showProcessed);
            plots.get('synthesis').update(analysisController.synthesizeSignal());
            plots.get('gabor').drawPlot();
            plots.get('synthesis').drawPlot();
        }, 50);
    }

    /**
     * Make the spectrogram editable or not.
     * @param {Boolean} editable True if the spectrogram is editable, false otherwise.
     */
    const toggleEdit = (editable) => {
        isEditable.current = editable;

        editButton.style.color = editable ? "#B01A00" : "var(--primary)";
        editButton.style.opacity = editable ? 1 : 0.5;

        selectionArea.style.visibility = editable ? "visible" : "collapse";
    }

    editButton.onclick = () => {
        toggleEdit(isEditable.current ? false : true);
        plots.get('gabor').setEditable(isEditable.current);

        if (isEditable.current) {
            fourierVisible.previous = fourierVisible.current;
            toggleFourier(false, fourierMovable);
            document.getElementById("fourier-visible").value = "no";
        } else {
            toggleFourier(fourierVisible.previous, fourierMovable);
            document.getElementById("fourier-visible").value = fourierVisible.previous ?
                "yes" : "no";
        }
    }

    cutButton.onclick = () => {
        if (isEditable.current) {
            setTimeout(function () {
                plots.get('gabor').cutArea();
                plots.get('gabor').drawPlot();
                plots.get('synthesis').update(analysisController.synthesizeSignal());
                plots.get('synthesis').drawPlot();
            }, 50);
        }
    }

    refreshButton.onclick = () => {
        changePlot();
    }

    /**
     * Converts the input value to float and sets the input box value.
     * @param {*} id Id of the input box. 
     * @returns Returns the float value of the input box.
     */
    const getInputNumber = (inputsMap, id) => {
        let newValue = parseFloat(inputsMap.get(id).value);
        inputsMap.get(id).value = newValue;
        return newValue;
    }

    return publicAPIs;
}