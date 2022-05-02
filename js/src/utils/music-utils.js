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
 * Converts a string of text (appropriately formatted) in a music sheet readable by the program.
 * @param {String} musicString String with music notation.
 * @returns The music sheet as an array of tracks and notes.
 */
const fromStringToMusic = (musicString) => {
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
                d: noteDuration,
                vol: noteVolume
            });
        })
    });
    return musicSheet;
}