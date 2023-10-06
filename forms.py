from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired, DataRequired

class SongForm(FlaskForm):
    song = StringField("Select a song:", validators=[InputRequired(), DataRequired()])
    submit = SubmitField("Update RPC")