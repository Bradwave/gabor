/**
 * Plot of the Fourier transform.
 * @param {Number} idNumber Id of the transform plot.
 * @param {*} inputFourierTransform Transform manager.
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let fourierPlot = function (idNumber, inputFourierTransform, options = []) {

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
     * Height of a plot cell.
     */
    let cellHeight;

    /**
     * Gabor transform structure.
     */
    let fourierTransform;

    /**
     * Rate of sampled frequency points.
     */
    let freqRate;

    /**
     * Updates the plot.
     * @param {*} inputFourierTransform Signal function f(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputFourierTransform, options) => {
        // Sets the frequency sample rate
        freqRate = toDefaultIfUndefined(options.freqRate, 12);

        options.freqRate = freqRate;

        // Sets the Gabor transform
        fourierTransform = inputFourierTransform;

        // Get number of points
        numPoints = fourierTransform.getNumPoints();
    }

    // Creates the plot
    publicAPIs.updatePlot(inputFourierTransform, options);

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

        cellHeight = height / numPoints;
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let j = 0; j < numPoints; j += freqRate) {
            // Gabor transform
            const ff = fourierTransform.fourierAt(j / freqRate);
            // Spectrogram
            let spectrogram = ff.abs();

            // Position of the cell
            const yPos = height - Math.round(j * cellHeight)
            // Grey value of the cell
            const alpha = Math.pow(- Math.exp(- spectrogram) + 1, 6);

            // Draws the cell
            ctx.beginPath();
            ctx.fillStyle = "rgba(176, 26, 0, " + alpha + ")"; 
            ctx.rect(
                0, yPos,
                Math.round(alpha * width * 0.1),
                height - Math.round((j + freqRate) * cellHeight) - yPos
            );
            ctx.fill();
            ctx.closePath();
        }
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}