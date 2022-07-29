Vue.component('score-input', {
    data() {
        return {
            scoreDiff: 0,
            extraPoints: 0
        }
    },
    props: ['match'],
    template: /*html*/`
        <div>
            <input type="range" class="form-range mb-3" min="-10" max="10" v-model="scoreDiff" @input="matchFinalScore(match)">
            <div class="justify-content-center d-flex gap-2">
                <button type="button" class="btn btn-primary" @click="addPoints">+</button>
                <button type="button" class="btn btn-warning" @click="clear">Clear</button>
                <button type="button" class="btn btn-danger" @click="match.inProgress=false; match.skip=true">Quit</button>
                <button type="button" class="btn btn-success" @click="saveScores">Save Scores</button>
            </div>
        </div>
    `,
    methods: {
        matchFinalScore: function() {
            const self = this;
            const match = self.match;
            const scoreDiff = parseInt(self.scoreDiff, 10);

            if (self.extraPoints > 0 && scoreDiff !== 0) {
                const base = self.extraPoints + 1;
                const winningScore = Math.abs(scoreDiff) + base;
                const losingScore = winningScore - 2;

                if (scoreDiff < 0) {
                    match.winningTeam = match.team1.id;
                    match.score1 = winningScore;
                    match.score2 = losingScore;
                    return;
                }

                match.winningTeam = match.team2.id;
                match.score1 = losingScore;
                match.score2 = winningScore;
                return;
            }

            if (scoreDiff < 0) {
                match.winningTeam = match.team1.id;
                match.score1 = 11
                match.score2 = 10 - (scoreDiff * -1) ;
                return;
            }
            
            if (scoreDiff > 0) {
                match.winningTeam = match.team2.id;
                match.score1 = 10 - scoreDiff;
                match.score2 = 11;
                return;
            }

            match.winningTeam = null;
            match.score1 = 0;
            match.score2 = 0;
        },
        clear: function() {
            const self = this;
            self.extraPoints = 0;
            self.scoreDiff = 0;
            self.matchFinalScore();
        },
        addPoints: function() {
            const self = this;
            self.extraPoints += 10;
            self.matchFinalScore();
        },
        saveScores: function() {
            /*
            Get history
            Tally: Team started, served order of everyone, team win, team loss
            Match: match id, start, end, score, winning team id, losing team id
            */
            const self = this;
            const match = self.match;

            const pickleHistoryStorage = localStorage.getItem('pickleHistoryStorage') || '{ "teams": {}, "players": {}, "matches": [] }';
            const pickleHistoryData = JSON.parse(pickleHistoryStorage);

            self.updateTeamStats(pickleHistoryData, match.team1);
            self.updateTeamStats(pickleHistoryData, match.team2);

            self.updatePlayerStats(pickleHistoryData);

            pickleHistoryData.matches.push({
                id: match.id,
                idTeam1: match.team1.id,
                idTeam2: match.team2.id,
                winningTeam: match.winningTeam,
                startTS: match.startTS,
                endTS: match.endTS,
                score1: match.score1,
                score2: match.score2,
            });

            localStorage.setItem('pickleHistoryStorage', JSON.stringify(pickleHistoryData));

            match.inProgress = false;
          
        },
        updatePlayerStats: function(data) {
            const match = this.match;
            const players = [ match.team1.p1, match.team1.p2, match.team2.p1, match.team2.p2 ];
            const winningPlayerIDs = match.winningTeam.split(':');

            const servedMap = [ 'first', 'fourth', 'second', 'third' ];

            players.forEach((player, index) => {
                if(!data.players.hasOwnProperty(player.id)) {
                    data.players[player.id] = {
                        win: 0,
                        loss: 0,
                        served: {
                            first: 0,
                            second: 0,
                            third: 0,
                            fourth: 0
                        }
                    };
                }
                let playerStats = data.players[player.id];

                playerStats.win += winningPlayerIDs.indexOf(player.id) > -1 ? 1 : 0;
                playerStats.loss += winningPlayerIDs.indexOf(player.id) < 0 ? 1 : 0;
                playerStats.served[servedMap[index]] += 1;
            })
        },
        updateTeamStats: function(data, team) {
            const match = this.match;
            const statsTeam = {
                firstServe: match.team1.id == team.id ? 1 : 0,
                win: team.id == match.winningTeam ? 1 : 0,
                loss: team.id !== match.winningTeam ? 1 : 0
            };

            if (data.teams.hasOwnProperty(team.id)) {
                let hisTeam = data.teams[team.id];

                for (const key in statsTeam) {
                    hisTeam[key] += statsTeam[key];
                }
            }
            else {
                data.teams[team.id] = statsTeam;
            }
        }
    }
});