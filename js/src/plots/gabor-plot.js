/**
 * Plot of the gabor transform.
 * @param {Number} idNumber Id of the transform plot.
 * @param {*} inputSignal Signal function f(x).
 * @param {*} inputWindowFunction Window function g(x).
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let gaborPlot = function (idNumber, inputSignal, inputWindowFunction, options = []) {

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
     * Number of sampled points in the Gabor transform.
     */
    let numPoints;

    /**
     * Number of sampled time points.
     */
    let timeNumPoints;

    /**
     * Number of sampled frequency points.
     */
    let freqNumPoints;

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
     * Rate of sampled time points.
     */
    let timeRate

    /**
     * Rate of sampled frequency points.
     */
    let freqRate;

    /**
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputSignal, inputWindowFunction, options) => {
        timeRate = toDefaultIfUndefined(options.timeRate, 8);
        freqRate = toDefaultIfUndefined(options.freqRate, 12);

        options.transformOptions["timeRate"] = timeRate;
        options.transformOptions["freqRate"] = freqRate;

        gaborTransform = new gaborTransformStructure(
            inputSignal, inputWindowFunction,
            options.transformOptions
        );

        numPoints = gaborTransform.getNumPoints();

        timeNumPoints = Math.round(numPoints / timeRate);
        freqNumPoints = Math.round(numPoints / freqRate);
    }

    // Creates the plot
    publicAPIs.updatePlot(inputSignal, inputWindowFunction, options);

    /*_______________________________________
    |   Canvas
    */

    const plot = new plotStructure(idNumber);
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

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numPoints; i += timeRate) {
            for (let j = 0; j < numPoints; j += freqRate) {
                // Gabor transform
                const vgf = gaborTransform.valueAt(i, j / freqRate);
                // Spectrogram
                const spectrogram = vgf.abs(); // Math.sqrt(vgf.amp());

                // Position of the cell
                const xPos = Math.round(i / numPoints * width);
                const yPos = height - Math.round(j / numPoints * height)
                // Grey value of the cell
                const alpha = - Math.exp(- spectrogram) + 1;

                // Draws the cell
                ctx.beginPath();
                ctx.fillStyle = "rgb("
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ")";
                ctx.rect(
                    xPos, yPos,
                    Math.round((i + timeRate) / numPoints * width) - xPos,
                    height - Math.round((j + freqRate) / numPoints * height) - yPos
                );
                ctx.fill();
            }
        }
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}