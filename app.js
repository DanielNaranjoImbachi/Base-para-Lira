const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const WsProvider = require('@bot-whatsapp/provider/baileys')
const DBProvider = require('@bot-whatsapp/database/mock')

let nombre;
let apellidos;
let sede;
let puesto;

const flujoComunicaciones = addKeyword('1')
.addAnswer('Escribe por Favor tu nombre:',{capture:true},async(ctx)=>{
    console.log('Celular: ', ctx.from)
    console.log('Mensaje entrante: ', ctx.body)
    nombre=ctx.body;
})
.addAnswer('Escribe tus dos apellidos',{capture:true},async(ctx)=>{
    console.log('Celular: ', ctx.from)
    console.log('Mensaje entrante: ', ctx.body)
    apellidos=ctx.body;
})
.addAnswer('Escribe el la sede en la cual se encuentra prestando el servicio',{capture:true},async(ctx)=>{
    console.log('Celular: ', ctx.from)
    console.log('Mensaje entrante: ', ctx.body)
    sede=ctx.body
})
.addAnswer('Escribe el puesto en el cual se encuentra prestando el servicio',{capture:true},async(ctx)=>{
    console.log('Celular: ', ctx.from)
    console.log('Mensaje entrante: ', ctx.body)
    puesto=ctx.body
})
.addAnswer(['Perfecto, verifiquemos los datos:','El nombre que digitaste es: *${nombre}*', 'Tus apellidos son: *${apellidos}*','y el puesto en el que estás prestando el servicio es: *${puesto}*', 'Si es correcto presiona *1*, si no es así, presiona *2*'])

const flujoSoporte = addKeyword('2')
.addAnswer(['Escribe el *número* de la opción que necesites:','*1*. Comunicaciones','*2*. CCTV','*3*. Alarmas','*4*. Otros'],{capture:true},(ctx, {fallBack})=>{
    console.log('Mensaje entrante: ', ctx.body)
    if(!ctx.body.includes(['1','2','3','4'])) {
        return fallBack()
    }
},[flujoComunicaciones])

const flujoPrincipal = addKeyword(['hola', 'buenas'])
.addAnswer(['Bienvenido a Lira Seguridad'], {
    media:'https://liraseguridad.com.co/static/images/Logo_LiraSeguridad.png'
})
.addAnswer(['Escribe el número de la opción que necesites', '*1*. Información','*2*. Área de Soporte','*3*. Área de gestión humana'],{capture:true},(ctx, {fallBack})=>{
    console.log('Mensaje entrante: ', ctx.body)
    if(!ctx.body.includes(['1','2','3'])) {
        return fallBack()
    }
}, [flujoSoporte])

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
