var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
var port = process.env.PORT || 5000
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

//DB Connection using the MongoDB 
//const dbUrl = Removing connect url for GitHub Upload.
const dbUrl = "mongodb+srv://admin:admin@mongo-node.jeyks.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

var server = http.listen(port, () => {
	console.log('Server is listening on port %d', port)
})

io.on('connection', (socket) => {
	console.log('User connected..')
})

mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) =>{
    console.log('mongo db connection', err)
})

mongoose.Promise = Promise


var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req,res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
}) 

app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body)
        var savedMessage = await message.save()
        console.log('saved', savedMessage)

        var censored = await Message.findOne({ message: 'badword' })

        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})

