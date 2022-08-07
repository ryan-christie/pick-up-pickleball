(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        methods: {
            spreadMore: function(matches) {
                const self = this;
                matches = matches?.type == 'click' ? [...self.matches] : matches;
                const now = Date.now();
                let iterations = 0;
                let foundSwap;
                do {
                    foundSwap = false;
                    const len = matches.length
                    for (let index = 0; index < len; index++) {
                        const match = matches[index];
                        if (index > 0 && index < (len - 1) && 
                            _.intersection(match.dnpIDs, matches[index+1].dnpIDs).length > 0 && 
                            _.intersection(matches[index-1].dnpIDs, matches[index+1].dnpIDs).length === 0)
                        {
                            matches[index] = matches[index-1];
                            matches[index-1] = match;
                            foundSwap = true;
                        }
                    }
                    iterations += 1;
                } while (Date.now() - now < 50 && foundSwap)
            
                self.matches = matches;
            }
        }
    });

})();