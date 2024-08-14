# txterm


## Commands

- `-V, --version`  
  Output the version number of `txterm`.

- `-l, --login`  
  Log in to `txterm`.

- `-r, --register`  
  Register a new account with `txterm`.

- `-c, --chat <recipient>`  
  Send a private message to a specified recipient.

- `-j, --join`  
  Join a channel.

- `-C, --create`  
  Create a new channel.

- `-a, --add <username>`  
  Add a new friend.

- `-h, --help`  
  Display help information for available commands.

## Installation

To set up `txterm-server`, follow these steps:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Rudra-241/txterm.git```
2. **Navigate to the server directory**
   ```sh
   cd txterm/server
   ```
3. **Start the server**
   (make sure you have mongodb installed)
   ```sh
   npm install
   npm start
   ```
For txterm-client:

1. **Navigate to client directory**
   ```sh
   cd txterm/client
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Link the txterm.js file**
   (might require root privelleges)
   ```sh
   npm link
   ```
4. **Run txterm**
   ```sh
   txterm --help
   ```
