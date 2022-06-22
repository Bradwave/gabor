/**
 * Music manager.
 * @returns Public APIs.
 */
const musicManager = new function () {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Time scale.
     */
    let timeScale = 1;

    /**
     * Volume.
     */
    let volume = 1;

    /**
     * Get the time scale factor.
     * @returns The time scale factor.
     */
    publicAPIs.getTimeScale = () => {
        return timeScale;
    }

    /**
     * Set the time scale
     * @param {Number} inputTimeScale Time scale.
     */
    publicAPIs.setTimeScale = (inputTimeScale) => {
        timeScale = inputTimeScale;
    }

    /**
     * Set the music volume multiplier.
     * @param {Number} inputVolume Volume multiplier.
     */
    publicAPIs.setVolume = (inputVolume) => {
        volume = inputVolume;
    }

    /**
     * Map of notes and their corresponding number value.
     */
    const notesMap = new Map([
        ["a&", -1], ["a", 0], ["a#", 1],
        ["b&", 1], ["b", 2], ["b#", 3],
        ["c&", 2], ["c", 3], ["c#", 4],
        ["d&", 4], ["d", 5], ["d#", 6],
        ["e&", 6], ["e", 7], ["e#", 8],
        ["f&", 7], ["f", 8], ["f#", 9],
        ["g&", 9], ["g", 10], ["g#", 11]
    ]);

    /**
     * Get the number of a note in the musical scale.
     * @param {String} id Name of the note.
     * @returns The number of the note in the musical scale.
     */
    publicAPIs.getNote = (id) => {
        return notesMap.get(id);
    }

    /**
     * Map of music sheets.
     */
    const musicSheets = new Map([
        [
            "ode to joy",
            "[e/1 e/1 f/1 g/1 g/1 f/1 e/1 d/1 c/1 c/1 d/1 e/1 d/1.5 c/.5 c/2]"
        ],
        [
            "bach toccata",
            "[a2/2 g1/2 a2/3 _/2 g1/1 f1/1 e1/1 d1/1 c#1/3 _/2 d1/8 _/8 a1/2 g/2 a1/3 _/2 e/2 f/2 c#/2 d/8]"
        ]
    ]);

    /**
     * Get a music sheet if available.
     * @param {String} id Name of the music sheet.
     * @returns The music sheet as a string.
     */
    publicAPIs.getMusicSheet = (id) => {
        return musicSheets.get(id);
    }

    /**
     * Converts a string of text (appropriately formatted) in a music sheet readable by the program.
     * @param {String} musicString String with music notation.
     * @returns The music sheet as an array of tracks and notes.
     */
    publicAPIs.fromStringToMusic = (musicString) => {
        let musicSheet = [];

        // Divides tracks
        let tracks = musicString.split(";");

        tracks.forEach((track, i) => {
            // Adds a new track to the music sheet
            musicSheet.push([]);

            // Removes "[", "]" and every space in between
            track = track.split("[")[1];
            track = track.split("]")[0];

            // Divides each note
            let notes = track.split(" ");
            notes.forEach(note => {
                // Divides the note value from its properties
                const noteStructure = note.split("/");

                // Divides the note name from the octave
                let noteValue = noteStructure[0];

                const isSilence = noteValue.localeCompare("_");
                const withOctave = isNaN(noteValue.slice(-1));
                const noteOctave = isSilence == 0 ? 0 :
                    (withOctave ? 0 : parseInt(noteValue.slice(-1)));
                const noteName = isSilence == 0 ? "a" :
                    (withOctave ? noteValue : noteValue.slice(0, -1));

                // Divides the note duration from the volume
                let noteProperties = noteStructure[1].split(":");
                let noteDuration = parseFloat(noteProperties[0]);
                let noteVolume = isSilence == 0 ? 0 :
                    parseFloat(toDefaultIfUndefined(noteProperties[1], 1));

                // Adds the note the track
                musicSheet[i].push({
                    note: noteName,
                    oct: noteOctave,
                    d: noteDuration * timeScale,
                    vol: noteVolume * volume
                });
            })
        });

        return musicSheet;
    }

    return publicAPIs;
}