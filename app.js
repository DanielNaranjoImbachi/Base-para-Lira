const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const express = require("express");
const mysql = require("mysql")
const QRPortalWeb = require('@bot-whatsapp/portal')
const WsProvider = require('@bot-whatsapp/provider/baileys')
const DBProvider = require('@bot-whatsapp/database/mock')

let conexion = mysql.createConnection({
    host: "localhost",
    database:"datoswhatsapp",
    user:"root",
    password:""
})

let nombre;
let apellidos;
let sede;
let puesto;
let opcion;
let celular;

const app = express()
app.listen(8080, function(){
    console.log("Servidor Configurado http://localhost:8080")
})

const flujoFinal = addKeyword('1')
.addAnswer('El nombre completo es: '+nombre+' '+apellidos+',te encuentras en la sede '+sede+' en el puesto '+puesto)
.addAnswer(['Llena por favor el siguiente formulario', 'https://liraseguridadltda.desk.2workers.me/Ticket/Novo'])

const flujoPuesto = addKeyword('1')
.addAnswer('Escribe por Favor el puesto en el cual está prestando el servicio:',{capture:true},async(ctx)=>{
    sede=ctx.body;
})
.addAnswer(['Perfecto, verifiquemos los datos:','El puesto en el cual se encuentra es: '+ puesto, 'es correcto?', '*1* Si','*2* No'], {capture:true}, (ctx, {gotoFlow})=> {
    if((ctx.body.includes('2'))) {
        return gotoFlow(flujoPuesto)
    }
    celular=ctx.from;
    console.log('Datos completos de la solicitud : ')
    console.log('Nombre: ', nombre)
    console.log('Apellidos: ', apellidos)
    console.log('Sede: ', sede)
    console.log('Puesto: ', puesto)
    console.log('Motivo: ', opcion)
    console.log('Número de celular: ', celular)
    let registrar = "INSERT INTO datosconversaciones (nombre, apellidos, sede, puesto, motivo, celular) VALUES ('"+nombre+"','"+apellidos+"','"+sede+"','"+puesto+"','"+motivo+"','"+celular+"')"
    conexion.query(registrar, function(error){
        if(error){ 
            throw error
        }else {
            console.log("Datos almacenados correctamente")
        }
    })
}, flujoFinal)

const flujoSede = addKeyword('1')
.addAnswer('Escribe por Favor la sede en la cual se encuentra prestando el servicio:',{capture:true},async(ctx)=>{
    sede=ctx.body;
})
.addAnswer(['Perfecto, verifiquemos los datos:','La sede en la cual se encuentra es: '+ sede, 'es correcto?', '*1* Si','*2* No'], {capture:true}, (ctx, {gotoFlow})=> {
    if((ctx.body.includes('2'))) {
        return gotoFlow(flujoSede)
    }
}, flujoPuesto)

const flujoApellido = addKeyword('1')
.addAnswer('Escribe por Favor tus apellidos:',{capture:true},async(ctx)=>{
    apellidos=ctx.body;
})
.addAnswer(['Perfecto, verifiquemos los datos:','Los apellidos que digitaste son: '+ apellidos, 'es correcto?', '*1* Si','*2* No'], {capture:true}, (ctx, {gotoFlow})=> {
    if((ctx.body.includes('2'))) {
        return gotoFlow(flujoApellido)
    }
}, flujoSede)

const flujoNombre = addKeyword('1','2','3','4')
.addAnswer('Escribe por Favor tu nombre:',{capture:true},async(ctx)=>{
    nombre=ctx.body;
})
.addAnswer(['Perfecto, verifiquemos los datos:','El nombre que digitaste es: '+ nombre, 'es correcto?', '*1* Si','*2* No'], {capture:true}, (ctx, {gotoFlow})=> {
    if((ctx.body.includes('2'))) {
        return gotoFlow(flujoNombre)
    }
}, flujoApellido)

const flujoInformacion = addKeyword('1')
.addAnswer(['Escribe el número de la opción con el tema que requieres información:','*1* Una cosa','*2* Otra Cosa'])

const flujoSoporte = addKeyword('2')
.addAnswer(['Escribe el *número* de la opción que necesites:','*1*. Comunicaciones','*2*. CCTV','*3*. Alarmas','*4*. Otros'],{capture:true},(ctx, {fallBack})=>{
    if(!(ctx.body.includes('1') || ctx.body.includes('2') || ctx.body.includes('3') || ctx.body.includes('4'))) {
        return fallBack()
    }
    opcion=ctx.body
},flujoNombre)

const flujoGH = addKeyword('3')
.addAnswer(['Escribe el número de la opción con el tema que requieres información:','*1* Una cosa','*2* Otra Cosa'])

const flujoPrincipal = addKeyword(['hola', 'buenas'])
.addAnswer(['Bienvenido a Lira Seguridad'], {
    media:'https://liraseguridad.com.co/static/images/Logo_LiraSeguridad.png'
    
})
.addAnswer(['Escribe el número de la opción que necesites', '*1*. Información','*2*. Área de Soporte','*3*. Área de gestión humana'],{capture:true},(ctx, {fallBack})=>{
    if(!(ctx.body.includes('1') || ctx.body.includes('2') || ctx.body.includes('3'))) {
        return fallBack()
    }
}, [flujoInformacion, flujoSoporte, flujoGH])

const main = async () => {
    const adapterDB = new DBProvider()
    const adapterFlow = createFlow([flujoPrincipal])
    const adapterProvider = createProvider(WsProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()

}

main()
