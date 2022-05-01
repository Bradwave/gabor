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
     * Number of time points.
     */
    let numTimePoints;

    /**
     * Number of frequency points.
     */
    let numFreqPoints;

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
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputSignal, inputWindowFunction, options) => {
        gaborTransform = new gaborTransformStructure(
            inputSignal, inputWindowFunction,
            options.transformOptions
        );

        numTimePoints = toDefaultIfUndefined(options.numTimePoints, 200);
        numFreqPoints = toDefaultIfUndefined(options.numFreqPoints, 100);
    }

    // Creates the plot
    publicAPIs.updatePlot(inputSignal, inputWindowFunction, options);

    /*_______________________________________
    |   HTML elements
    */

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

        cellWidth = width / numTimePoints;
        cellHeight = height / numFreqPoints;
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numTimePoints; i++) {
            for (let j = 0; j < numFreqPoints; j++) {

                // Gabor transform
                const vgf = gaborTransform.valueAt(
                    i / numTimePoints,
                    j / numFreqPoints
                );

                // Spectrogram
                const spectrogram = Math.sqrt(vgf.amp());
                // console.log(vgf)

                const xPos = Math.round(i * cellWidth);
                const yPos = height - Math.round(j * cellHeight)

                const alpha = (- Math.exp(- spectrogram) + 1) ** 2;

                ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
                ctx.fillRect(
                    xPos, yPos,
                    Math.round((i + 1) * cellWidth) - xPos,
                    height - Math.round((j + 1) * cellHeight) - yPos
                );
            }
        }
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}