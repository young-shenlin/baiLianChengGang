const http=require('http')
const slice=Array.prototype.slice

class LikeExpress{
    constructor(){
        this.routes={
            all:[],
            get:[],
            post:[]
        }
    }

    register(path){
        const info= {}
        if (typeof path === 'string') {
            info.path=path
            //第二个参数开始，转化为数组，导入stack
            info.stack=slice.call(arguments,1)
        } else {
            info.path='/' //********* */
            //第一个参数开始，转化为数组，导入stack
            info.stack=slice.call(arguments,0)
        }
        return info
    }

    use(){
        const info=this.register.apply(this,arguments)
        this.routes.all.push(info)
    }

    get(){
        const info=this.register.apply(this,arguments)
        this.routes.get.push(info)
    }

    post(){
        const info=this.register.apply(this,arguments)
        this.routes.post.push(info)
    }

    match(method,url){
        let stack=[]
        if (url==='/favicon.ico') {
            return stack
        } 

        let curRoutes=[]
        curRoutes=curRoutes.concat(this.routes.all)
        curRoutes=curRoutes.concat(this.routes[method])

        curRoutes.forEach(routerInfo=>{
            if (url.indexOf(routerInfo.path)===0) {
                stack=stack.concat(routerInfo.stack)
            } 
        })
        return stack
    }
    //核心next机制
    handle(req,res,stack){
        const next=()=>{
            //拿第一个匹配中间件
            const middleware=stack.shift()
            if (middleware) {
                //执行
                middleware(req,res,next)
            }
        }
        next()
    }
    callback(){
        return (req,res)=>{
            res.json=(data)=>{
                res.setHeader('Content-type','application/json')
                res.end(JSON.stringify(data))
            }
            const url=req.url
            const method=req.method.toLowerCase()

            const resultList=this.match(method,url)
             this.handle(req,res,resultList)
        }
    }

    listen(...args){
        const server=http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = ()=>{
    return new LikeExpress()
}