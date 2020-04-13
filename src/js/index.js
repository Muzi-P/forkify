// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import { elements, renderloader, clearLoader } from './views/base';
import List from './models/List';

/*** Global State
 * - Search 
 * - Current Recipe Object
 * - Shopping List Object
 * - Liked recipes
 */
const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();
    if (query) {
        // 2. New Search object and add it to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderloader(elements.searchRes);
        // 4. Search for Results
        await state.search.getRecipe();

        // 5. Render result on UI
        clearLoader();
        searchView.renderResults(state.search.result)

    }
};


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage)
    }
});


/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
    //  get ID from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        //  Prepare UI for changes
        recipeView.clearRecipe();
        renderloader(elements.recipe)

        // highlight selected
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id)
        try {
            // Get recipe data and parse ingredientss
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            console.log(err);
            alert('Error processing recipe!')
        }

    }

    window.r = new List;
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * List CONTROLLER
 */

const controlList = () => {
    //  Create a new list if there's no list

    if (!state.list) state.list = new List();

    // add each ingredient into the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//  handle delete and update list event
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle delete button

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);

        // handle the count
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id,val)
    }
});


// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //  Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredient(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredient(state.recipe);
    }
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
})













// Here are the 3 things that you need to know about forkify-api which are DIFFERENT from the food2fork API in the videos:

// 1) No API key is required;

// 2) No proxy is required;

// 3) The URL is forkify-api.herokuapp.com (click for basic documentation).



// 👉 This is how you use forkify-api instead of the food2fork API.

// In the Search.js file (as soon as you get there), just replace:

// const res = await axios(`${PROXY}http://food2fork.com/api/search?key=${KEY}&q=${this.query}`);
// with this:

// const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);


// Then, in Recipe.js (as soon as you get there), please replace:

// const res = await axios(`${PROXY}http://food2fork.com/api/get?key=${KEY}&rId=${this.id}`);
// with this:

// const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);


// 👉 That's it, that's all you need to know. Again, make these changes as you go through the projects. For now, just keep following the videos. And now, have fun with the project 😘