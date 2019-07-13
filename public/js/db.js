db.enablePersistence()
    .catch(err => {
        if (err.code === 'failed-precondition') {
            // Probably multiple tabs open at once
            console.log('Persistence failed')
        } else if (err.code === 'unimplemented') {
            // lack of browser support
            console.log('Persistence is not available')
        }
    })

// real time listener
db.collection('recipes').onSnapshot(snapshot => {
    // console.log(snapshot.docChanges())
    snapshot.docChanges().forEach(change => {
        // console.log(change, change.doc.data(), change.doc.id)
        if (change.type === 'added') {
            // add document data to web page
            renderRecipe(change.doc.data(), change.doc.id)
        }
        if (change.type === 'removed') {
            // remove the data to web page
            removeRecipe(change.doc.id)
        }
    })
})

// add new recipe
const form = document.querySelector('form')
form.addEventListener('submit', evt => {
    evt.preventDefault()

    const { title, ingredients } = form
    const recipe = {
        title: title.value,
        ingredients: ingredients.value
    }

    db.collection('recipes').add(recipe)
        .catch(err => console.log(err))

    form.title.value = ''
    form.ingredients.value = ''
})

// delete recipe
const recipeContainer = document.querySelector('.recipes')
recipeContainer.addEventListener('click', evt => {
    // console.log(evt)
    if (evt.target.tagName === 'I') {
        const id = evt.target.getAttribute('data-id')
        db.collection('recipes').doc(id).delete()
    }
})