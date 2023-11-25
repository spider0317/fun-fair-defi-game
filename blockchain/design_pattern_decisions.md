### Commit/Reveal: 

Implemented to ensure fair play, as users can only verify their encrypted moves after submitting them. Comes at the cost of users having to remember what their original moves were.

### Salted hash

To make it difficult for participants to calculate the hash of small random numbers.
Instead of a direct hash, I have used a salted hash. The user will have to reveal the number and salt before the game can start. The salt will make the hash unaffordable to precalculate.

### Game Expiration:

 Implemented to ensure payouts always occurred, even for abandoned games or sore losers. 

### "Fail Early and Fail Loud":

 I used require() statements wherever possible, as the first execution in the function logic.

### Restricting Access:

 I was very selective with what state variables are publicly readable, and what functions are publicly callable, and put checks in place to ensure the appropriate addresses (the players) are the only ones who can call functions on the games they're playing. I intentionally made player in-game wallet balances public as a temporary solution to help me update the state on the front end more easily.


### Owner-only Functions: 

I opted out of creating a selfdestruct function because I want users to trust that I won't run away with their in-escrow wagers. I didn't even want to implement a circuitBreaker function but it's a requirement for this assignment. Yes, currently the app can be paused while games are ongoing, which could force those games to expire without users being able to take action.

### Contract Simplicity and Readability: Monolithic 

I opted into writing a single contract, as opposed to separating the modifiers and function calls into separate contracts, because IMO the contract is still manageable to read. If it got any longer I'd certainly split it up into multiple inherited contracts for easier auditability. 

### Circuit Breaker: 

The function owner can pause all action on the contract in case of an emergency. There is a situation here where games will still expire, thus possibly causing someone to lose an ongoing game.

### "Balance withdrawal" pattern:

 To protect users from DoS attacks from malicious contracts, I've implemented this pattern to separate ether transfer logic from game logic.

### Events:

I use event listeners on the front end as a way to trigger UI value/state refreshing.
Additional Notes
