/**
 * Map of notes and their corresponding number value.
 */
const notesMap = new Map();

for (i = 0; i < 12; i++) {
    notesMap.set(String.fromCharCode(97 + i) + "&", i - 1);
    notesMap.set(String.fromCharCode(97 + i), i);
    notesMap.set(String.fromCharCode(97 + i) + "#", i + 1);
}

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
            let noteOctave = toDefaultIfUndefined(parseInt(noteValue.slice(-1)), 0);
            let noteName = noteValue.slice(0, -1);

            // Divides the note duration from the volume
            let noteProperties = noteStructure[1].split(":");
            let noteDuration = parseFloat(noteProperties[0]);
            let noteVolume = toDefaultIfUndefined(parseFloat(noteProperties[1]), 1);

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