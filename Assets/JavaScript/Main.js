//Cria um elemento para ser adicionado na game view.
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}


//Monta a barreira e a barreira reversa.
function Barreira(reversa = false) {
    //Pega o elemento dom pegando a partir da função passada.
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div' , 'borda')
    const corpo = novoElemento('div', 'corpo')
    //Verifica se coloca a borda primeiro ou o corpo.
    this.elemento.appendChild(reversa ? corpo:borda)
    this.elemento.appendChild(reversa ? borda:corpo)
    //Define a altura da barreira.
    this.setAltura = altura => corpo.style.height = `${altura}px`
}



//Define as barreias(espaço e altura).
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    //Define a barreira inferior e superior.
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    //Adiciona as barreiras.
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
    //Cria a altura.
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        //Envia a altura para o elemento.
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)  
    }
    
    //Retorna a posição X(horizontal) da barreira.
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    //Altera o X, ou seja envia o valor do eixo X.
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    //Chama a função.
    this.sortearAbertura()
    this.setX(x)
    
} 


//Define mais de uma barreira, e suas sequências de posições.
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]


    //Movimentação de 3 em 3 pixels(VELOCIDADE).
    const deslocamento = 3



    //Faz a animação.
    this.animar = () => {
        this.pares.forEach(par => {
            //Pega o X atual subtrai o deslocamento e envia para ter o novo posicionamento.
            par.setX(par.getX() - deslocamento)

            //Quando o elemento sair da game view.
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
            }

            //Indica se cruzou o meio.
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            //Se for verdadeiro ele executa.
            //Envia o ponto
            if(cruzouOMeio) notificarPonto()
        })
    }
}

//Adiciona o pássaro definindo o voou do mesmo.
function Passaro (alturaJogo) {
    let voando = false 

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`
    
    //Seta true quando se aperta qualquer tecla.
    window.onkeydown = e => voando = true
    //Seta quando soltar a tecla.
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5 )
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        //Evita passar para fora da área de jogo.
        if(novoY <= 0) {
            this.setY(0)
        } else if(novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo/2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPonto = pontos => {
        //Coloca os pontos que recebeu como parâmetros.
        this.elemento.innerHTML = pontos 
    }
    this.atualizarPonto(0)
}


function estaoSobrepostos(elementoA, elementoB) {
    //Pega o retângulo equivalente ao elemento.
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    //Validação de colisão.
    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

//Função de colisão.
function colidiu(passaro, barreias) {
    let colidiu = false
    barreias.pares.forEach(ParDeBarreiras => {
        if(!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento

            //Define true para colidiu
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0
    //Adiciona todos elementos à tela.
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPonto(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //Loop do jogo
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)) {
                clearInterval(temporizador)
            }
        },20)
    }
}

//Instância o jogo completo.
new FlappyBird().start()

//Recarrega o jogo do início.


const recarregar = document.querySelector("[wm-clic]");
//Pega o evendo de click, e executa a função.
recarregar.addEventListener("click", function() {
    //Recarrega a página local.
    location.reload();
})
