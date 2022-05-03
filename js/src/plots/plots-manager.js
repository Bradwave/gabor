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

    /**
     * Spinning loaders.
     */
    let loaders = [...document.getElementsByName("plot-loader")];

    /**
     * Plot containers.
     */
    let canvases = [...document.getElementsByName("plot")];

    /**
     * Plots.
     */
    let plots = [];

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
     * Number of sampled points for the signal and window.
     */
    let signalNumPoints = 1200;

    /**
     * Number of sampled points for the Gabor transform.
     */
    let gaborNumPoints = 1200;

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
     * Music sheet for the signal.
     */
    let musicSheet = "[a#/1 a1/2:2 a2/1.5:0.5]; [f1/2:1.5 _/1.5 g&1/0.5]";

    publicAPIs.update = function () {
        updateInputBoxes();

        //Signal setup
        let signal;
        try {
            signal = new musicSignal(musicManager.fromStringToMusic(musicSheet),
                { N: signalNumPoints, timeScale: timeScale });
        } catch (error) {
            console.log(error);
            signal = new musicSignal(musicManager.fromStringToMusic("[a/1:1]"),
                { N: signalNumPoints, timeScale: timeScale });
        }

        // Window setup
        const g1 = new gaussianWindow(sigma1,
            { N: signalNumPoints, timeScale: timeScale });
        const g2 = new gaussianWindow(sigma2,
            { N: signalNumPoints, timeScale: timeScale });

        const signalTransform = new transformManager(
            signal, g1,
            {
                N: gaborNumPoints,
                padding: padding,
                timeRate: timeRate,
                freqRate: freqRate
            }
        );

        // Signal, window and Gabor transform plots.
        plots = [
            // Signal plot
            new signalPlot(1, signal,
                {
                    N: signalNumPoints
                }),
            // Window plot
            new windowPlot(2, g1,
                {
                    signal: signal,
                    N: signalNumPoints,
                    useTwoWindows: useTwoWindows,
                    window2: g2
                }),
            // Gabor transform plot
            new gaborPlot(3, signalTransform,
                {
                    useTwoWindows: useTwoWindows,
                    window2: g2,
                    timeRate: timeRate,
                    freqRate: freqRate
                }
            ),
            new fourierPlot(4, signalTransform,
                {
                    freqRate: freqRate,
                })
        ];
    }

    // On window resize
    window.onresize = () => {
        plots.forEach(plot => {
            // Resize the canvas
            plot.resizeCanvas();
        });

        setLoadingStyle(true);

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setLoadingStyle(false);

            plots.forEach(plot => {
                // Draws the plot after waiting (for better performances)
                plot.drawPlot();
            });
        }, waitTime);
    }

    // On window click (get focus)
    window.onclick = (e) => {
        e.target.focus();
        if (e.target.id.localeCompare("canvas-4") == 0) {
            canvases[2].classList.add('focused');
            canvases[3].classList.add('focused');
        } else {
            canvases[2].classList.remove('focused');
            canvases[3].classList.remove('focused');
        }
    }

    function setLoadingStyle(isLoading, opacity = 0) {
        if (isLoading) {
            canvases.forEach(canvas => {
                // Hides the canvases
                canvas.style.opacity = opacity;
                canvas.style.visibility = "hidden";
            });

            loaders.forEach(loader => {
                // Displays the loader while waiting
                loader.style.opacity = 1;
                loader.style.visibility = "visible";
                loader.style.animationPlayState = "running";
            });
        } else {
            canvases.forEach(canvas => {
                // Displays the canvases
                canvas.style.opacity = 1;
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
    |   Inputs for ring plots
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
            // Updates the textarea value
            textarea.value = musicSheet;

            // Updates the textarea height
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight - 20 + "px";
        }

        changePlot();
    }

    /**
     * Ids of input boxes for the ring plot.
     */
    let inputIds = ['signal-num-points', 'time-scale',
        'sigma-1', 'sigma-2',
        'gabor-num-points', 't-rate', 'f-rate', 'zoom'];

    /**
     * Input boxes for ring plot.
     */
    let plotInputs = new Map();

    inputIds.forEach((id) => {
        plotInputs.set(id, document.getElementById(id));
    })

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
        signalNumPoints = getInputNumber(plotInputs, 'signal-num-points');
        timeScale = getInputNumber(plotInputs, 'time-scale');

        // Window
        sigma1 = getInputNumber(plotInputs, 'sigma-1');
        const sigma2Input = plotInputs.get('sigma-2').value;
        if (sigma2Input.localeCompare("no") == 0) {
            useTwoWindows = false;
        } else {
            useTwoWindows = true;
            sigma2 = getInputNumber(plotInputs, 'sigma-2')
        }

        // Gabor
        gaborNumPoints = getInputNumber(plotInputs, 'gabor-num-points');
        timeRate = getInputNumber(plotInputs, 't-rate');
        freqRate = getInputNumber(plotInputs, 'f-rate');
        padding = getInputNumber(plotInputs, 'zoom');
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