/**
 * Plot of the Gabor transform.
 * @param {Number} idNumber Id of the transform plot.
 * @param {*} inputGaborTransform Transform manager.
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let gaborPlot = function (idNumber, inputGaborTransform, options = []) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the plot.
     */
    let width;

    /**
     * Height of the plot.
     */
    let height;

    /*_______________________________________
    |   General variables
    */

    /**
     * Number of sampled time points in the Gabor transform.
     */
    let numPoints;

    /**
    * Rate of sampled time points.
    */
    let timeRate

    /**
     * Rate of sampled frequency points.
     */
    let freqRate;

    /**
     * Width of a plot cell.
     */
    let cellWidth;

    /**
     * Height of a plot cell.
     */
    let cellHeight;

    /**
     * Gabor transform structure.
     */
    let gaborTransform;

    /**
     * Sampled and scaled spectrogram.
     */
    let scaledSpectrogram;

    /**
     * True if two windows are used, false otherwise.
     */
    let useTwoWindows;

    /**
     * True if the the spectrogram is editable, false otherwise.
     */
    let isEditable;

    /**
     * Selection element div.
     */
    let selectionArea;

    let selecting = false;

    let selected = false;

    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;

    /**
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputGaborTransform, options) => {
        // Sets the time and frequency sample rate
        timeRate = toDefaultIfUndefined(options.timeRate, 8);
        freqRate = toDefaultIfUndefined(options.freqRate, 12);

        // Sets the Gabor transform
        gaborTransform = inputGaborTransform;

        // Get number of time points
        numPoints = gaborTransform.getNumPoints();

        // Sets the Gabor transform if the second window is present
        useTwoWindows = toDefaultIfUndefined(options.useTwoWindows, false);
        gaborTransform.setUseTwoWindows(useTwoWindows);

        isEditable = toDefaultIfUndefined(options.isEditable, false);
        selectionArea = options.selectionArea;

        scaledSpectrogram = gaborTransform.getScaledSpectrogram();

        console.log("!")
    }

    // Creates the plot
    publicAPIs.updatePlot(inputGaborTransform, options);

    /**
     * Sets the visibility of the processed spectrogram.
     * @param {Boolean} showProcessed True if the processed spectrogram is visible, false otherwise.
     */
    publicAPIs.setProcessedVisibility = (showProcessed) => {
        gaborTransform.setProcessedSynthesis(showProcessed);
        scaledSpectrogram = gaborTransform.getScaledSpectrogram();
    }

    publicAPIs.setEditable = (isSpectrogramEditable) => {
        isEditable = isSpectrogramEditable;
    }

    /*_______________________________________
    |   Canvas
    */

    const plot = new plotStructure(idNumber, { alpha: false });
    const ctx = plot.getCtx();

    /**
     * Resize the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        plot.resizeCanvas();

        width = plot.getWidth();
        height = plot.getHeight();

        cellWidth = width / numPoints;
        cellHeight = height / numPoints;
    }

    plot.getCanvas().onmousedown = (e) => {
        if (isEditable) {
            selecting = true;
            const rect = e.target.getBoundingClientRect();
            // Position within the element
            x1 = e.clientX - rect.left;
            y1 = e.clientY - rect.top;

            selectionArea.style.left = x1 + 'px';
            selectionArea.style.top = y1 + 'px';
            selectionArea.style.width = '0px';
            selectionArea.style.height = '0px';

            selectionArea.style.opacity = 1;
            selectionArea.style.visibility = "visible";
        }
    }

    plot.getCanvas().onmousemove = (e) => {
        if (isEditable && selecting) {
            selected = false;

            const rect = e.target.getBoundingClientRect();
            // Position within the element
            x2 = e.clientX - rect.left;
            y2 = e.clientY - rect.top;

            if (x2 > x1) {
                selectionArea.style.width = x2 - x1 + 'px';
            } else {
                selectionArea.style.left = x2 + "px";
                selectionArea.style.width = x1 - x2 + 'px';
            }
            if (y2 > y1) {
                selectionArea.style.height = y2 - y1 + 'px';
            } else {
                selectionArea.style.top = y2 + 'px';
                selectionArea.style.height = y1 - y2 + 'px';
            }
        }
    }

    plot.getCanvas().onmouseup = () => {
        if (isEditable) {
            if (isBetween(x2, x1 - 2, x1 + 2) && isBetween(y2, y1 - 2, y1 + 2)) {
                selected = false;
                selectionArea.style.opacity = 0;
                selectionArea.style.visibility = "hidden";
            } else {
                selected = true;
            }
            selecting = false;
        }
    }

    plot.getCanvas().onclick = (e) => {
        const rect = e.target.getBoundingClientRect();
        // Position within the element
        x2 = e.clientX - rect.left;
        y2 = e.clientY - rect.top;

        if (isBetween(x2, x1 - 2, x1 + 2) && isBetween(y2, y1 - 2, y1 + 2)) {
            selecting = false;
            selected = false;
            selectionArea.style.opacity = 0;
            selectionArea.style.visibility = "hidden";
        }
    }

    publicAPIs.cutArea = () => {
        if (selected) {
            const t1 = dpi * (x1 < x2 ? x1 / width : x2 / width);
            const t2 = dpi * (x2 > x1 ? x2 / width : x1 / width);

            const omega1 = 1 - dpi * (y2 > y1 ? y2 / height : y1 / height);
            const omega2 = 1 - dpi * (y1 < y2 ? y1 / height : y2 / height);

            gaborTransform.cutSpectrogram(t1, t2, omega1, omega2);
            scaledSpectrogram = gaborTransform.getScaledSpectrogram();
        }
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numPoints; i += timeRate) {
            for (let j = 0; j < numPoints; j += freqRate) {
                let spectrogram = scaledSpectrogram[i / timeRate][j / freqRate];

                // Position of the cell
                const xPos = Math.round(i * cellWidth);
                const yPos = height - Math.round(j * cellHeight)
                // Grey value of the cell
                // const alpha = - Math.pow(Math.exp(- spectrogram), 1 / 4) + 1;
                const alpha = spectrogram;

                // Draws the cell
                ctx.beginPath();
                ctx.fillStyle = "rgb("
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ")";
                ctx.rect(
                    xPos, yPos,
                    Math.round((i + timeRate) * cellWidth) - xPos,
                    height - Math.round((j + freqRate) * cellHeight) - yPos
                );
                ctx.fill();
            }
        }
    }

    /**
     * Clears the plot.
     */
    publicAPIs.clearPlot = () => {
        ctx.fillStyle = "#ffffff";

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fill();
        ctx.closePath();
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}