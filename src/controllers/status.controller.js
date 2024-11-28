

const postPingController = (req, res) =>{
    console.log(
        'Consulta recibida en /ping de tipo POST: ', req.body
    )

    console.log(req.user)
    res.status(200).json({status:200, message: 'pong', ok: true})
}

export default postPingController