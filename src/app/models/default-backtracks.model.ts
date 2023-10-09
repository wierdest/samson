import { BackTrack } from "./back-track.model"

export class DefaultBackTracks {
    static getTracks() : BackTrack[] {

        const tracks: BackTrack[] = [

            new BackTrack(
                'Track 1', 
                'DRUMSTATION', 
                'Boom Bap', 
                90, 
                0, 
                './assets/track1.mp3',
                'https://youtu.be/_hY9bDJ0dSE?si=cztyIvkvaZntGflu'
            ),
            new BackTrack(
                'Track 2', 
                'prod.dailydailydaily', 
                'Neo Soul', 
                75, 
                0, 
                './assets/track2.mp3',
                'https://youtu.be/pSPs0uvY1ts?si=vFBplHTZHfAEJxCv'
    
            ),
            new BackTrack(
                'Track 3', 
                'DRUMSTATION', 
                'Hip Hop', 
                88, 
                0, 
                './assets/track3.mp3',
                'https://youtu.be/JNjYXdaK4Qo?si=5Nz-hX0_kTFzd8Z5'
    
            ),

            new BackTrack(
                'Track 11', 
                'prod.dailydailydaily', 
                'Neo Soul', 
                110,
                0, 
                './assets/track11.mp3',
                'https://youtu.be/SY64iGdbfBE?si=9Vtl1r9jT8IjcS-i'
            ),

            new BackTrack(
                'Track 4', 
                'DRUMSTATION', 
                'Afrobeat Reggaeton', 
                88, 
                0, 
                './assets/track4.mp3',
                'https://youtu.be/ikQE0MzwidY?si=2yBpKJw_idfDTMbm'
    
            ),

            new BackTrack(
                'Track 12', 
                'prod.dailydailydaily', 
                'Neo Soul 6/8', 
                75,
                0, 
                './assets/track12.mp3',
                'https://youtu.be/gxOeTKuYZhs?si=H2wwQpkCpHiAwejE'
            ),

            new BackTrack(
                'Track 5', 
                'DRUMSTATION', 
                'Funk', 
                92, 
                0, 
                './assets/track5.mp3',
                'https://youtu.be/PjfTULbvvos?si=1PZL1vhUXbKNoa-W'
    
            ),
            new BackTrack(
                'Track 6', 
                'DRUMSTATION', 
                'Hip Hop RNB', 
                106, 
                0, 
                './assets/track6.mp3',
                'https://youtu.be/lAI1zIwGmcI?si=Z5cjgiWCZi7MwDx1'
    
            ),
            
            new BackTrack(
                'Track 14', 
                'prod.dailydailydaily', 
                'Neo Soul', 
                80,
                0, 
                './assets/track14.mp3',
                'https://youtu.be/49ttJ4W6R60?si=A9EnUOqtMuOs4uoK'
            ),

            new BackTrack(
                'Track 7', 
                'DRUMSTATION', 
                'Hip Hop Boom Bap', 
                93, 
                0, 
                './assets/track7.mp3',
                'https://youtu.be/vW99nqdhuXo?si=vzkogI0Frb62hbNn'
    
            ),

            new BackTrack(
                'Track 13', 
                'prod.dailydailydaily', 
                'Neo Soul', 
                80,
                0, 
                './assets/track13.mp3',
                'https://youtu.be/43xqSxWNkX0?si=LyTFMuYXhvhjscOt'
            ),

            new BackTrack(
                'Track 8', 
                'DRUMSTATION', 
                'Angry Hip Hop Boom Bap', 
                95, 
                0, 
                './assets/track8.mp3',
                'https://youtu.be/HtAub7iF2zQ?si=Msbyg5mQZOcuhv-6'
            ),

            new BackTrack(
                'Track 9', 
                'DRUMSTATION', 
                'Funk Hip Hop', 
                85,
                0, 
                './assets/track9.mp3',
                'https://youtu.be/K0NHrjvJg28?si=Cyivs4MCXImX45rn'
            ),

            new BackTrack(
                'Track 10', 
                'DRUMSTATION', 
                'Boom Bap', 
                87,
                0, 
                './assets/track10.mp3',
                'https://youtu.be/f3ja_RCQabs?si=K_NrIPpQXCsVoP4y'
            ),

        ];
        return tracks;
    }

}