/**
 * Manages plots, sort of...
 */
let plotsManager = new function () {

    /**
     * Public methods.
     */
    let publicAPI = {};

    /**
     * Number of milliseconds to wait after resizing.
     * @type {Number}
     */
    const waitTime = 200;

    let resizeTimeout;

    /**
     * Spinning loaders
     */
    let loaders = [...document.getElementsByClassName("plot loader")];

    plot = [];

    publicAPI.init = function () {
        /**
     * Window function.
     */
        let g1 = new gaussianWindow(.5);
        let g2 = new gaussianWindow(.2);

        /**
         * Music sheet of Ode to Joy.
         */
        let odeToJoySheet = [
            [
                { note: "e", d: 1, vol: .4 },
                { note: "e", d: 1, vol: .6 },
                { note: "f", d: 1, vol: .8 },
                { note: "g", d: 1, vol: 1 },
                { note: "g", d: 1, vol: 1 },
                { note: "f", d: 1, vol: 1 },
                { note: "e", d: 1, vol: 1 },
                { note: "d", d: 1, vol: 1 },
                { note: "c", d: 1, vol: 1 },
                { note: "c", d: 1, vol: 1 },
                { note: "d", d: 1, vol: 1 },
                { note: "e", d: 1, vol: 1 },
                { note: "d", d: 1.5, vol: 1 },
                { note: "c", d: 0.5, vol: 1 },
                { note: "c", d: 1, vol: 1 },
                { note: "c", d: .5, vol: .6 },
                { note: "c", d: .5, vol: .3 }
            ]
        ];

        /**
         * Music signal of Ode to Joy.
         */
        let odeToJoy = new musicSignal(odeToJoySheet, { timeScale: 30 });

        let test1 = [
            [
                { note: "e", oct: 0, d: 1, vol: 1 },
                { note: "e", oct: 1, d: 1, vol: 1 },
                { note: "e", oct: 2, d: 1, vol: 1 }
            ]
        ];

        let testSignal1 = new musicSignal(test1, { timeScale: 20 });

        let testMusicString = "[a#/1:1 a1/2:1 a2/1.5:0.5]; [g&1/2:1.5]";

        let odeToJoySheet2 = "[e/1:1]"
        let testSignal2 = new musicSignal(fromStringToMusic(testMusicString), {timeScale: 20});

        /**
         * Signal and Gabor plot.
         */
        plots = [
            new signalPlot(1, testSignal2, { numPoints: 1000 }),
            new windowPlot(2, g1, { signal: testSignal2, numPoints: 1000 }),
            new gaborPlot(3, testSignal2, g1, { transformOptions: { N: 1500, padding: .2 } }),
        ];
    }

    window.onresize = () => {
        plots.forEach((plot) => {
            // Resize the canvas
            plot.resizeCanvas();
        });

        loaders.forEach((loader) => {
            // Displays the loader while waiting
            loader.style.visibility = "visible";
            loader.style.animationPlayState = "running";
        });

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            plots.forEach((plot) => {
                // Draws the plot after waiting (for better performances)
                plot.drawPlot();
            });

            loaders.forEach((loader) => {
                // Displays the loader while waiting
                loader.style.visibility = "hidden";
                loader.style.animationPlayState = "paused";
            });
        }, waitTime);
    }

    window.onclick = (e) => {
        e.target.focus();
    }

    /*_______________________________________
    |   Inputs for ring plots
    */

    /**
     * Ids of input boxes for the ring plot.
     */
    let inputIds = [];

    /**
     * Input boxes for ring plot.
     */
    let plotInputs = new Map();

    inputIds.forEach((id) => {
        plotInputs.set(id, document.getElementById(id));
    })

    // Sets listeners
    plotInputs.forEach((input) => {
        input.onchange = () => {
            changePlot();
        }
    });

    /**
     * Update plot when input boxes change.
     */
    function changePlot() {

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

    return publicAPI;
}