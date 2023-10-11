from flask import *
import requests
from forms import SongForm
from data import dl, id_to_name, dx_ids, dx_dl
from werkzeug.datastructures import Headers
from flask_login import LoginManager, UserMixin
import os

app = Flask(__name__)
application = app
app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]

login_manager = LoginManager()
login_manager.init_app(app)

User = UserMixin()

headers = Headers()
headers.add_header("Access-Control-Allow-Origin", "*")


@app.before_request
def make_session_permanent():
    session.permanent = True


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect("/")
    return '''
        <form method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    '''


@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect("/login")


def update_id_file(newid):
    idfile = open("songID.txt", "w+")
    idfile.write(str(newid))
    idfile.close()


def get_id():
    idfile = open("songID.txt", "r")
    currentid = idfile.read()
    idfile.close()
    return currentid


def update_dx_file(val):
    idfile = open("dx.txt", "w+")
    idfile.write(str(val))
    idfile.close()


def get_dx():
    idfile = open("dx.txt", "r")
    dx_val = idfile.read()
    idfile.close()
    return dx_val


@app.route("/", methods=["GET", "POST"])
def update_rpc():
    y = False
    try:
        x = session['username']
        y = True
    except KeyError as e:
        y = False
    if y:
        if session['username'] == os.environ["AUTH"]:
            form = SongForm()
            if form.is_submitted():

                result = request.form

                x = False

                for key, value in result.items():
                    if key == "song":
                        for trackID, name in id_to_name.items():
                            if name == value:
                                update_id_file(trackID)
                                update_dx_file(0)
                                x = True

                songValue = ""
                for key, value in result.items():
                    if key == "song":
                        songValue = value

                return render_template("form_redirect.html", result=result, form=form, dl=dl, songValue=songValue, valid=x)
            return render_template("form.html", form=form, dl=dl, songValue="Choose a song...")
        else:
            return '''
                <p>You are not authorized to visit this page. <a href="/logout">Logout</a></p>
            '''
    else:
        return '''
            <p>You are not logged in. <a href="/login">Login</a></p>
        '''

@app.route("/deluxe", methods=["GET", "POST"])
def update_rpc_dx():
    y = False
    try:
        x = session['username']
        y = True
    except KeyError as e:
        y = False
    if y:
        if session['username'] == os.environ["AUTH"]:
            form = SongForm()
            if form.is_submitted():

                result = request.form

                x = 1

                for key, value in result.items():
                    if key == "song":
                        for trackID, name in id_to_name.items():
                            if name == value:
                                for dx_id in dx_ids:
                                    if trackID == dx_id:
                                        update_id_file(trackID)
                                        update_dx_file(1)
                                        x = 0
                                if x == 1:
                                    x = 2

                songValue = ""
                for key, value in result.items():
                    if key == "song":
                        songValue = value

                return render_template("form_redirect_dx.html", result=result, form=form, dl=dx_dl, songValue=songValue, valid=x)
            return render_template("form_dx.html", form=form, dl=dx_dl, songValue="Choose a song...")
        else:
            return '''
                    <p>You are not authorized to visit this page. <a href="/logout">Logout</a></p>
                '''
    else:
        return '''
                <p>You are not logged in. <a href="/login">Login</a></p>
            '''


def prep_lines():
    filepath = str("songs/" + str(get_id()) + ".txt")
    file = open(filepath, "r")
    lines = file.readlines()
    return lines


@app.route("/appID", methods=["GET"])
def app_id():
    return Response("1157305973849989233", headers=headers)


@app.route("/appName", methods=["GET"])
def app_name():
    if get_dx() == "0":
        return Response("Beatstar", headers=headers)
    else:
        return Response("Beatstar [Deluxe]", headers=headers)


@app.route("/details", methods=["GET"])
def details():
    line = str(prep_lines()[1])
    line = line.replace("\n", "")
    return Response(line, headers=headers)


@app.route("/state", methods=["GET"])
def state():
    line = str(prep_lines()[2])
    line = line.replace("\n", "")
    return Response(line, headers=headers)


@app.route("/imageBig", methods=["GET"])
def image_big():
    return Response(str("https://beatstarrpc.jeddev.net/covers/" + str(get_id()) + ".jpeg"), headers=headers)


@app.route("/imageSmall", methods=["GET"])
def image_small():
    return Response("https://i.imgur.com/LGBp2jW.png", headers=headers)


@app.route("/buttonOneText", methods=["GET"])
def button_one_text():
    return Response("BeatSCORE Song Link", headers=headers)


@app.route("/buttonOneURL", methods=["GET"])
def button_one_url():
    return Response(str("https://beatscore.eu/song/" + str(get_id())), headers=headers)


@app.route("/buttonTwoText", methods=["GET"])
def button_two_text():
    return Response("beatstarRPC GitHub Repo", headers=headers)


@app.route("/buttonTwoURL", methods=["GET"])
def button_two_url():
    return Response(str("https://github.com/JJJed/beatstarRPC"), headers=headers)


if __name__ == '__main__':
    app.run()
