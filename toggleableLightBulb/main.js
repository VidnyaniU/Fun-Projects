//GSAP library
const {
    gsap: { registerPlugin, set, to, timeline },
    MorphSVGPlugin,
    Draggable,
} = window
registerPlugin(MorphSVGPlugin)

//to calculate distance of "tug"
let startX
let startY

const AUDIO = {
    CLICK: new Audio('https://assets.codepen.io/605876/click.mp3'),
}
const STATE = {
    ON: false,
}

//DOM element references
const CORD_DURATION = 0.1

const CORDS = document.querySelectorAll('.toggle-scene__cord')
const HIT = document.querySelector('.toggle-scene__hit-spot')
const DUMMY = document.querySelector('.toggle-scene__dummy-cord')
const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line')
const PROXY = document.createElement('div')

//set init position
const ENDX = DUMMY_CORD.getAttribute('x2')
const ENDY = DUMMY_CORD.getAttribute('y2')

const RESET = () => {
    set(PROXY, {
        x: ENDX,
        y: ENDY,
    }
    )
}

RESET()

//to  create a GSAP timeline named CORD_TL for animating the cord movement and light toggle
const CORD_TL = timeline({
    paused: true,
    onStart: () => {
        STATE.ON = !STATE.ON
        set(document.documentElement, { '--on': STATE.ON ? 1 : 0 })
        set([DUMMY, HIT], { display: 'none' })
        set(CORDS[0], { display: 'block' })
        AUDIO.CLICK.play()
    },

    onComplete: () => {
        set([DUMMY, HIT], { display: 'block' })
        set(CORDS[0], { display: 'none' })
        RESET()
    },
})

//ANIMATING CORDS
//A loop iterates through all cord elements except the first one (index 0)
for (let i = 1; i < CORDS.length; i++) {
    CORD_TL.add(
        to(CORDS[0], {
            morphSVG: CORDS[i], //the current cord element being looped through
            duration: CORD_DURATION,
            repeat: 1,  //animates back and forth once
            yoyo: true,  //makes the animation reverse after reaching the end
        })
    )
}

//DRAGGABLE INTERACTION
Draggable.create(PROXY, {
    trigger: HIT,
    type: 'x,y',
    onPress: e => {
        startX = e.x
        startY = e.y
    },

    onDrag: function () {
        set(DUMMY_CORD, {
            attr: {
                x2: this.x,
                y2: this.y,
            },
        })
    },

    onRelease: function (e) {
        const DISTX = Math.abs(e.x - startX)
        const DISTY = Math.abs(e.y - startY)
        const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY)

        to(DUMMY_CORD, {
            attr: {
                x2: ENDX, y2: ENDY
            },

            duration: CORD_DURATION,
            onComplete: () => {
                if (TRAVELLED > 50) {
                    CORD_TL.restart()
                } else {
                    RESET()
                }
            },
        })
    },
})