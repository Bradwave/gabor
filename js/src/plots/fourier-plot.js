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
     * Percentage of the canvas width used.
     */
    let widthScale;

    /**
     * Exponent used to scale the spectrogram. 
     */
    let power;

    /**
     * Position of the plot in the canvas.
     */
    let fourierPosition = 0;

    /**
     * True if the plot is visible, false otherwise.
     */
    let visible = false;

    /**
     * Ture if the transform is movable, false otherwise.
     */
    let movable = false;

    /**
     * Resets the Fourier transform position.
     */
    publicAPIs.resetFourierPosition = () => {
        fourierPosition = 0;
        publicAPIs.drawPlot();
    }

    /**
     * Set the position of the transform in the plot.
     * @param {Number} position Position ∈ [0,1]
     */
    publicAPIs.setFourierPosition = (position) => {
        fourierPosition = position;
    }

    /**
     * Set the visibility of the plot.
     * @param {Boolean} visibility True if visible, false otherwise.
     */
    publicAPIs.setVisibility = (visibility) => {
        visible = visibility;
    }

    /**
     * Set the movability of the transform.
     * @param {Boolean} visibility True if movable, false otherwise.
     */
    publicAPIs.setMovability = (movability) => {
        movable = movability;
    }

    /**
     * Updates the plot.
     * @param {*} inputFourierTransform Signal function f(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputFourierTransform, options) => {
        // Sets the frequency sample rate
        freqRate = toDefaultIfUndefined(options.freqRate, 12);
        
        // Sets the Gabor transform
        fourierTransform = inputFourierTransform;

        // Sets the coefficients if the frequency rate is different
        if (freqRate != inputFourierTransform.getFreqRate()) {
            fourierTransform.updateCoefficients(freqRate);
        }

        // Get number of points
        numPoints = fourierTransform.getNumPoints();

        // Sets graphical settings
        power = toDefaultIfUndefined(options.power, 4);
        widthScale = toDefaultIfUndefined(options.scale, 0.1);

        fourierPosition = toDefaultIfUndefined(options.position, 0);
        visible = toDefaultIfUndefined(options.visibility, false);
        movable = toDefaultIfUndefined(options.movability, false);
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
     * Moves the position of the Fourier plot.
     */
    plot.getCanvas().onmouseup = (e) => {
        if (visible && movable) {
            const rect = e.target.getBoundingClientRect();
            // x position within the element
            const x = e.clientX - rect.left;
            // Position in the plot
            fourierPosition = x * dpi / width;

            plotsManager.setFourierPosition(fourierPosition);

            // Draws plot
            publicAPIs.drawPlot();
        }
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

            // Grey value of the cell
            const alpha = - Math.pow(Math.exp(- spectrogram), 1 / power) + 1;
            // Position of the cell
            const xPos = (fourierPosition * width) - fourierPosition * alpha * width * widthScale;
            const yPos = height - Math.round(j * cellHeight)

            // Draws the cell
            ctx.beginPath();
            ctx.fillStyle = "rgba(176, 26, 0, " + alpha + ")";
            ctx.rect(
                xPos, yPos,
                Math.round(alpha * width * widthScale),
                height - Math.round((j + freqRate) * cellHeight) - yPos
            );
            ctx.fill();
            ctx.closePath();
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