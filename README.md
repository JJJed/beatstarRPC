# beatstarRPC
___
## Description
beatstarRPC is a web panel to post Beatstar activity 
to your Discord profile.
## Installation

### Requirements

- Python (3.11.x)

  - flask

    - `pip3 install flask`

  - flask_login

    - `pip3 install flask_login`

  - flask_wtf (and wtforms)

    - `pip3 install flask_wtf`

  - werkzeug

    - `pip3 install werkzeug`

  - Note: these should be installed inside the
  `beatstarRPC-master` directory that you will create later.

- Discord Desktop Client w/ Vencord

  - Discord Desktop Client

    - https://discord.com/download (Desktop)

  - Vencord

    - https://vencord.dev/download/

### Setup

- Download beatstarRPC
  - Download the master branch as a zip, and extract it.
  The new directory should be named `beatstarRPC-master`.

- Setup environment variables

  - You'll need to set two environment variables.
    1. SECRET_KEY - This should be random, and only
    visible to you. You can generate one by running
    `python -c 'import secrets; print(secrets.token_hex(64))'`
    in your terminal or command prompt.
    2. AUTH - This should also only be visible to yourself,
    this will be what you need to enter on the login page.
    You can put whatever you want here.
    Note: As you will most likely be using a locally
    hosted server, this authentication/authorization
    system probably
    isn't so important, so no need to make your
    code extra secure.

- Install Vencord

  - Run the Vencord installer you downloaded previously.

- Import the beatstarRPC Vencord plugin into Vencord

  - Navigate to your Vencord installation location
  - Once inside the `Vencord` directory, navigate to `src`.
  - Once inside, create a new directory named `userplugins`.
  - Navigate inside `userplugins`.
  - In another window, navigate inside the
  `beatstarRPC-master` directory that you extracted
  from the downloaded zip earlier.
  - Once inside `beatstarRPC-master`, copy the directory `vencordPlugin/beatstarRPC`.
  - Switch back to the `userplugins` window, and paste in the copied directory.

- Restart Discord

## Usage
Usaage of beatstarRPC is fairly straightforwards.
1. Start the web server.
   1. Run `flask --app server run` in your terminal or
   command prompt. Make sure you are in the directory that
   contains the server.py file (and the others at the same
   level).
2. Visit http://127.0.0.1:5000
3. Login
   1. Login with whatever you chose to put as the value for
   your AUTH environment variable.
4. Enable the beatstarRPC Vencord plugin
   1. In Discord, go to Settings, and click
   on Plugins (under Vencord).
   2. Enable the plugin named `BeatstarRPC`.
   There shouldn't be any settings to configure.
5. Update your activity
   1. Go back to http://127.0.0.1:5000 (you should
   stay logged in), start typing in the name of a
   song/artist in Beatstar, and click on a song in the
   suggestions (it is important that you click on the song
   from the suggestions).
   2. Click on the `Update RPC` button, your activity
   should be reflected in Discord within 5 seconds.

Note: I recommend turning off the `BeatstarRPC` Vencord
plugin when not using it. I also highly recommend enabling
the `GameActivityToggle` Vencord plugin, it provides a
convenient way to disable game activity.
