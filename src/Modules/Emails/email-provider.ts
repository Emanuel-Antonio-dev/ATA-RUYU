abstract class IAddress{
    email: string
    name: string
}
abstract class  IMessage{
    to: IAddress
    from: IAddress
    subject: string
    body: string
}
abstract class IEmailProvider
{
    abstract sendEmail(message: IMessage):Promise<void>
}
export{IMessage, IEmailProvider}