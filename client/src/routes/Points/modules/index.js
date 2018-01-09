
import { combineReducers } from 'redux';
import _ from 'underscore'

import initialState from '../initial-state'
import { 
  get_default_collection,
  get_new_collection
} from '../initial-state'
import store from '../../../main'

export const IGNORE = 'IGNORE'
export const ADD_NEW_COLLECTION = 'ADD_NEW_COLLECTION'
export const ADD_POINT = 'ADD_POINT'
export const UPDATE_APP_SECTION_STATE = 'UPDATE_APP_SECTION_STATE'
export const TOGGLE_VIEW_VISIBILITY = 'TOGGLE_VIEW_VISIBILITY'
export const REPLACE_COLLECTION = 'REPLACE_COLLECTION'
export const MOVE_NEW_COLLECTION_SEARCH_FOCUS = 'MOVE_NEW_COLLECTION_SEARCH_FOCUS'
export const MOVE_NEW_POINT_TAG_FOCUS = 'MOVE_NEW_POINT_TAG_FOCUS'
export const MOVE_SECTION_FOCUS = 'MOVE_SECTION_FOCUS'
export const MOVE_TAG_SEARCH_FOCUS = 'MOVE_TAG_SEARCH_FOCUS'
export const MOVE_TAB_FOCUS = 'MOVE_TAB_FOCUS'
export const REMOVE_TAG_FROM_NEW_POINT = 'REMOVE_TAG_FROM_NEW_POINT'
export const SHOW_TAGS_LIST_FORM = 'SHOW_TAGS_LIST_FORM'
export const SHOW_TAGS_LIST_SEARCH = 'SHOW_TAGS_LIST_SEARCH'
export const ADD_TAG_TO_NEW_POINT = 'ADD_TAG_TO_NEW_POINT'
export const UPDATE_SEARCH_SUGGESTIONS = 'UPDATE_SEARCH_SUGGESTIONS'
export const CHANGE_COLLECTION_MODE = 'CHANGE_COLLECTION_MODE'




//TODO: this should probs be stored somewhere else
const base_url = 'http://localhost:8000'



export const post_collection = (new_collection_data) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let url = base_url + '/collections';
      let post_body = JSON.stringify({collection:new_collection_data});
      let req_options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: post_body
      };
      fetch(url, req_options)
        .then((response) => {
          let promise = response.json();
          let collection_index = get_focused_array_index(getState().points.collections);
          promise.then(resp_body => {
            let collection = resp_body.collection;
            collection.app = get_default_collection().app;
            collection.points = [];
            collection.tags = [];
            dispatch({
              type: REPLACE_COLLECTION,
              collection: collection,
              collection_index
            })
            resolve();
          })
        })
        .catch((error)=> {
          console.error('errrrrrrrr');
          console.error(error)
          resolve();
        });
    })
  }
}

export const post_tag = (new_tag_data) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let url = base_url + '/tags';
      let post_body = JSON.stringify({tag:new_tag_data});
      let req_options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: post_body
      };
      fetch(url, req_options)
        .then((response) => {
          let promise = response.json();
          let collection_index = get_focused_array_index(getState().points.collections);
          promise.then(resp_body => {
            let tag = resp_body.tag;
            tag.app = {'in_focus': false};
            dispatch({
              type: ADD_TAG_TO_NEW_POINT,
              tag: tag,
              collection_index
            })
            resolve();
          })
        })
        .catch((error)=> {
          console.error('errrrrrrrr');
          console.error(error)
          resolve();
        });
    })
  }
}


const get_new_point_tag_ids = (collection) => {
  let tags = _.find(collection.app.views.new_point.sections, section => {
  return section.name === 'tags_list'
  }).tags;
  return _.map(tags, tag => {
    return tag.tag_id
  })
}

export const post_point = (point_data) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let url = base_url + '/points';
      let collections = getState().points.collections;
      let focused_collection = get_focused_array_item(collections);
      let tag_ids = [];
      if (focused_collection.app.mode.select_points){
        tag_ids = get_new_point_tag_ids(focused_collection)
      }
      let post_body = JSON.stringify({point:point_data, tag_ids:tag_ids});
      let req_options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: post_body
      };
      fetch(url, req_options)
        .then((response) => {
          let promise = response.json();
          let collection_index = get_focused_array_index(getState().points.collections);
          promise.then(resp_body => {
            let point = resp_body.point;
            dispatch({
              type: ADD_POINT,
              point: point,
              collection_index
            })
            document.getElementById('question_input').value = '';
            document.getElementById('answer_input').value = '';
            resolve();
          })
        })
        .catch((error)=> {
          console.error('errrrrrrrr');
          console.error(error)
          resolve();
        });
    })
  }
}


export const search = (search_type, search_value) => {
  return (dispatch, getState) => {
    if (search_value.length < 1){
      return dispatch({
        type: IGNORE
      })
    }
    return new Promise((resolve, reject) => {
      let url = base_url + '/' + search_type + '/search/' + search_value;
      fetch(url, {})
        .then((response) => {
          let promise = response.json();
          promise.then(resp_body => {
            let suggestions = resp_body.suggestions;
            _.each(suggestions, function(suggestion){
              suggestion.app = {in_focus: false};
            });
            let collections = getState().points.collections;
            let collection = get_focused_array_item(collections);
            dispatch({
              type: UPDATE_SEARCH_SUGGESTIONS,
              collection_index: get_focused_array_index(collections),
              suggestions
            });
            resolve();
          })
        })
        .catch((error)=> {
          console.error('errrrrrrrr');
          console.error(error)
          resolve();
        });
    })
  }
}


const handle_new_point_command = (dispatch, collection_index, focused_collection, event) => {
  let sections = focused_collection.app.views.new_point.sections;
  let key = event.key;
  if (event.altKey){
    if (key === 'j'){
      return dispatch({
        type: MOVE_SECTION_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        view_name: 'new_point',
        direction: 1 })
    } else if (key === 'k'){
      return dispatch({
        type: MOVE_SECTION_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        view_name: 'new_point',
        direction: -1
      })
    } else {
      return dispatch({
        type: IGNORE
      })
    }
  }
  let focused_section = _.find(sections, function(section){
      return section.in_focus;
  });
  if (focused_section.name === 'tags_list'){
    if (key === 'h'){
      return dispatch({
        type: MOVE_NEW_POINT_TAG_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        direction: -1
      })
    } else if (key === 'l'){
      return dispatch({
        type: MOVE_NEW_POINT_TAG_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        direction: 1
      })
    } else if (key === 'x'){
      let tag_index = get_focused_array_index(focused_section.tags);
      return dispatch({
        type: REMOVE_TAG_FROM_NEW_POINT,
        collection_index: collection_index,
        collection: focused_collection,
        tag_index
      })
    }
  } else if (focused_section.name === 'tags_search'){
    if (event.ctrlKey && key === 'j'){
      return dispatch({
        type: MOVE_TAG_SEARCH_FOCUS,
        direction: 1,
        collection_index,
        collection: focused_collection
      });
    } else if (event.ctrlKey && key === 'k'){
      return dispatch({
        type: MOVE_TAG_SEARCH_FOCUS,
        direction: -1,
        collection_index,
        collection: focused_collection
      });
    } else if (key === 'Enter'){
      let tag = get_focused_array_item(focused_section.search_suggestions);
      return dispatch({
        type: ADD_TAG_TO_NEW_POINT,
        collection_index,
        tag
      });
    }
    return dispatch({
      type: IGNORE
    })
  }
}

const handle_collection_editor_command  = (dispatch, collection_index, focused_collection, event) => {
  let sections = focused_collection.app.views.new_point.sections;
  let key = event.key;
  if (event.altKey){
    if (key === 'j'){
      return dispatch({
        type: MOVE_SECTION_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        view_name: 'collection_editor',
        direction: 1 })
    } else if (key === 'k'){
      return dispatch({
        type: MOVE_SECTION_FOCUS,
        collection_index: collection_index,
        collection: focused_collection,
        view_name: 'collection_editor',
        direction: -1
      })
    }
  }
  return dispatch({
    type: IGNORE
  })
}

export const detect_keypress = (event) => {
  return (dispatch, getState) => {
    let collections = getState().points.collections;
    let collection_index = get_focused_array_index(collections);
    let focused_collection = get_focused_array_item(collections);
    let key = event.key;

    //will probably call different functions from this function when
    //I know how I'll organize it

    let global_tab_keys = ['t', '[', ']'];
    if (event.altKey && global_tab_keys.indexOf(key) > -1){
      return detect_keypress_global(dispatch, event);
    }

    // NEW COLLECTION
    if (focused_collection.app.is_new){
      let sections = focused_collection.app.sections;
      if (event.altKey){
        if (key === 'k' || key === 'j'){
          let direction = key === 'k' ? -1: 1;
          return dispatch({
            type: MOVE_SECTION_FOCUS,
            new_section_state: sections,
            collection: focused_collection,
            direction, 
            collection_index: collection_index
          })
        } else {
          return dispatch({
            type: IGNORE
          })
        }
      } else {
        if (event.ctrlKey && key === 'j'){
          return dispatch({
            type: MOVE_NEW_COLLECTION_SEARCH_FOCUS,
            direction: 1,
            collection_index,
            collection: focused_collection
          });
        } else if (event.ctrlKey && key === 'k'){
          return dispatch({
            type: MOVE_NEW_COLLECTION_SEARCH_FOCUS,
            direction: -1,
            collection_index,
            collection: focused_collection
          });
        } else if (key === 'Enter'){
          let search_suggestions = _.find(sections, section => {
            return section.name === 'collection_search';
          }).search_suggestions;
          let collection_to_fetch = get_focused_array_item(search_suggestions);
          return new Promise((resolve, reject) => {
            let url = base_url + '/collections/' + collection_to_fetch.collection_id
            fetch(url, {})
              .then((response) => {
                let promise = response.json();
                promise.then(resp_body => {
                  return dispatch({
                    type: REPLACE_COLLECTION,
                    collection_index,
                    collection: resp_body.collection
                  });
                  resolve();
                })
              })
              .catch((error)=> {
                console.error('errrrrrrrr');
                console.error(error)
                resolve();
              });
          })
        }
        return dispatch({
          type: IGNORE
        })
      }
    }

    else if (focused_collection.app.views.new_point.in_focus){
      handle_new_point_command(dispatch, collection_index, focused_collection, event);
    } else if (focused_collection.app.views.collection_editor.in_focus){
      handle_collection_editor_command(dispatch, collection_index, focused_collection, event);
    }

    //OTHER VIEWS
    if (event.altKey && key === 'a'){
      return dispatch({
        type: TOGGLE_VIEW_VISIBILITY,
        collection: focused_collection,
        view_name: 'new_point',
        collection_index
      })
    } else if (event.altKey && key === 'c'){
      return dispatch({
        type: TOGGLE_VIEW_VISIBILITY,
        collection: focused_collection,
        view_name: 'collection_editor',
        collection_index
      })
    }

  }
}


export const detect_keypress_global = (dispatch, event) => {
  let key = event.key;
    //TAB ACTIONS
    if (event.altKey && key == 't'){
      let new_collection = get_new_collection();
      return dispatch({
        type: ADD_NEW_COLLECTION,
        collection: new_collection
      })
    }

    if (event.altKey && key == '['){
      return dispatch({
        type: MOVE_TAB_FOCUS,
        direction: -1
      })
    }

    if (event.altKey && key == ']'){
      return dispatch({
        type: MOVE_TAB_FOCUS,
        direction: 1
      })
    }
}

const set_item_focus = (item, focus) => {
  if (item.hasOwnProperty('app')){
    item.app.in_focus = focus;
  } else {
    item.in_focus = focus;
  }
}

const move_array_focus = (arr, direction) => {
  let new_arr = arr.slice();
  let first_time = true;
  for (let i = 0; i < new_arr.length; i++){
    let item_in_focus;
    if (new_arr[i].hasOwnProperty('app')){
      item_in_focus = new_arr[i].app.in_focus;
    } else {
      item_in_focus = new_arr[i].in_focus;
    }
    if (item_in_focus){
      first_time = false;
      if (direction === -1 && i !== 0){
        set_item_focus(new_arr[i], false)
        set_item_focus(new_arr[i-1], true)
        break;
      } else if (direction === 1 && i !== new_arr.length -1){
        set_item_focus(new_arr[i], false)
        set_item_focus(new_arr[i+1], true)
        break; }
    }
  }
  if (first_time){
    if (direction === -1){
      set_item_focus(new_arr[new_arr.length-1], true)
    } else if (direction === 1){
      set_item_focus(new_arr[0], true)
    }
  }
  return new_arr
}

const get_focused_array_index = (arr) => {
  for (let i = 0; i < arr.length; i++){
    if (arr[i].app.in_focus || arr[i].in_focus){
      return i;
    }
  }
  return -1;
}

export const get_focused_array_item = (arr) => {
  for (let i = 0; i < arr.length; i++){
    if (arr[i].app.in_focus || arr[i].in_focus){
      return arr[i]
    }
  }
  return null;
}


// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [IGNORE]: (state, action) => state,

  //GLOBAL ACTIONS

  [MOVE_TAB_FOCUS]: (state, action) => {
    return {
      ...state,
      collections: move_array_focus(state.collections, action.direction)
    };
  },


  [ADD_POINT]: (state, action) => {
    let index = action.collection_index;
    let collection = state.collections[index];
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        {
          ...collection,
          points: [
            action.point,
            ...collection.points
          ]
        },
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [ADD_TAG_TO_NEW_POINT]: (state, action) => {
    let index = action.collection_index;
    let collection = state.collections[index];
    let sections = collection.app.views.new_point.sections;
    let section_i;
    let tags_list = _.find(sections, (section, i) => {
      if (section.name === 'tags_list'){ section_i = i; return true; };
    });
    tags_list.tags.push(action.tag);
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        {
          ...collection,
          app: {
            ...collection.app,
            views: {
              ...collection.app.views,
              new_point: {
                ...collection.app.views.new_point,
                sections: [
                  ...collection.app.views.new_point.sections.slice(0,section_i),
                  tags_list,
                  ...collection.app.views.new_point.sections.slice(section_i+1),
                ]
              }
            }
          }
        },
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [ADD_NEW_COLLECTION]: (state, action) => {
    let new_collections = state.collections.map(collection => {
      collection.app.in_focus = false;
      return collection
    })
    new_collections.push(action.collection);
    return {
      ...state,
      collections: new_collections
    };
  },

  [MOVE_NEW_COLLECTION_SEARCH_FOCUS]: (state, action) => {
    let index = action.collection_index;
    let collection = action.collection;
    let collection_search = _.find(collection.app.sections, section => {
      return section.name === 'collection_search';
    })
    let suggestions = collection_search.search_suggestions;
    suggestions = move_array_focus(suggestions, action.direction);
    collection_search.search_suggestions = suggestions;
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [MOVE_TAG_SEARCH_FOCUS]: (state, action) => {
    let index = action.collection_index;
    let collection = action.collection;
    let sections = collection.app.views.new_point.sections;
    let tags_search = _.find(sections, section => {
      return section.name === 'tags_search';
    });
    let suggestions = tags_search.search_suggestions;
    suggestions = move_array_focus(suggestions, action.direction);
    tags_search.search_suggestions = suggestions;
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [MOVE_SECTION_FOCUS]: (state, action) => {
    let index = action.collection_index;
    let collection = action.collection;
    if (collection.app.is_new){
      let sections = move_array_focus(collection.app.sections, action.direction);
      return {
        ...state,
        collections: [
          ...state.collections.slice(0, index),
          {
            ...collection,
            app: {
              ...collection.app,
              sections: sections
            }
          },
          ...state.collections.slice(index + 1)
        ]
      };
    }
    let focused_view = _.find(collection.app.views, view => {
      return view.in_focus;
    });
    let sections = focused_view.sections;
    sections = move_array_focus(sections, action.direction);
    if (action.view_name === 'new_point'){
      return {
        ...state,
        collections: [
          ...state.collections.slice(0, index),
          {
            ...collection,
            app: {
              ...collection.app,
              views: {
                ...collection.app.views,
                new_point: {
                  ...collection.app.views.new_point,
                  sections: sections
                }
              }
            }
          },
          ...state.collections.slice(index + 1)
        ]
      };
    } else if (action.view_name === 'collection_editor'){
      return {
        ...state,
        collections: [
          ...state.collections.slice(0, index),
          {
            ...collection,
            app: {
              ...collection.app,
              views: {
                ...collection.app.views,
                collection_editor: {
                  ...collection.app.views.collection_editor,
                  sections: sections
                }
              }
            }
          },
          ...state.collections.slice(index + 1)
        ]
      };
    }

  },

  [MOVE_NEW_POINT_TAG_FOCUS]: (state, action) => {
    let index = action.collection_index;
    let collection = state.collections[index];
    let sections = collection.app.views.new_point.sections;
    let section_i;
    let tags_list = _.find(sections, (section, i) => {
      if (section.name === 'tags_list'){ section_i = i; return true; };
    });
    let tags = move_array_focus(tags_list.tags, action.direction);
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        {
          ...collection,
          app: {
            ...collection.app,
            views: {
              ...collection.app.views,
              new_point: {
                ...collection.app.views.new_point,
                sections: [
                  ...collection.app.views.new_point.sections.slice(0,section_i),
                  {
                    ...tags_list,
                    tags: tags
                  },
                  ...collection.app.views.new_point.sections.slice(section_i+1),
                ]
              }
            }
          }
        },
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [REMOVE_TAG_FROM_NEW_POINT]: (state, action) => {
    let collection = action.collection;
    let index = action.collection_index;
    let tag_index = action.tag_index;
    let tags_list = _.find(collection.app.views.new_point.sections, section => {
      return section.name === 'tags_list';
    }).tags;
    if (tags_list.length > 1){
      if (tag_index === 0){
        tags_list[1].app.in_focus = true;
      } else {
        tags_list[tag_index-1].app.in_focus = true;
      }
    }
    tags_list.splice(action.tag_index, 1);
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [REPLACE_COLLECTION]: (state, action) => {
    let collection = action.collection;
    let index = action.collection_index;
    collection.app = get_default_collection().app;
    collection.app.in_focus = true;
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [SHOW_TAGS_LIST_FORM]: (state, action) => {
    let collection = action.collection;
    let index = action.collection_index;
    let new_point_sections = collection.app.views.new_point.sections;
    let tags_list = _.find(new_point_sections, section => {
      return section.name == 'tags_list';
    });
    tags_list.app.show_form = !tags_list.app.show_form;
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [SHOW_TAGS_LIST_SEARCH]: (state, action) => {
    let collection = action.collection;
    let index = action.collection_index;
    let new_point_sections = collection.app.views.new_point.sections;
    let tags_list = _.find(new_point_sections, section => {
      return section.name == 'tags_list';
    });
    tags_list.app.show_search = !tags_list.app.show_search;
    return {
      ...state,
      collections: [
        ...state.collections.slice(0, index),
        collection,
        ...state.collections.slice(index + 1),
      ]
    };
  },

  [TOGGLE_VIEW_VISIBILITY]: (state, action) => {
    let collection = action.collection;
    let index = action.collection_index;
    if (action.view_name === 'new_point'){
      let view_in_focus = !collection.app.views.new_point.in_focus;
      let point_list_in_focus = !view_in_focus;
      return {
        ...state,
        collections: [
          ...state.collections.slice(0, index),
          {
            ...collection,
            app: {
              ...collection.app,
              views: {
                ...collection.app.views,
                new_point: {
                  ...collection.app.views.new_point,
                  in_focus: view_in_focus
                },
                point_list: {
                  in_focus: point_list_in_focus
                }
              }
            }
          },
          ...state.collections.slice(index + 1),
        ]
      };
    } else if (action.view_name === 'collection_editor'){
      let view_in_focus = !collection.app.views.collection_editor.in_focus;
      let point_list_in_focus = !view_in_focus;
      return {
        ...state,
        collections: [
          ...state.collections.slice(0, index),
          {
            ...collection,
            app: {
              ...collection.app,
              views: {
                ...collection.app.views,
                collection_editor: {
                  ...collection.app.views.collection_editor,
                  in_focus: view_in_focus
                },
                point_list: {
                  in_focus: point_list_in_focus
                }
              }
            }
          },
          ...state.collections.slice(index + 1),
        ]
      };
    }
  },

  [UPDATE_APP_SECTION_STATE]: (state, action) => {
    let index = action.collection_index;
    let new_collections = [
      ...state.collections.slice(0, index),
      {
        ...state.collections[index],
        app: {
          ...state.collections[index].app,
          sections: action.new_section_state
        }
      },
      ...state.collections.slice(index + 1)
    ];
    return {
      ...state,
      collections: new_collections
    };
  },

  [UPDATE_SEARCH_SUGGESTIONS]: (state, action) => {
    let index = action.collection_index;
    let collection = state.collections[index];
    if (collection.app.is_new){
      let collection_search = _.find(collection.app.sections, section => {
        return section.name === 'collection_search';
      });
      collection_search.search_suggestions = action.suggestions;
    } else {
      let tags_search = _.find(collection.app.views.new_point.sections, section => {
        return section.name === 'tags_search';
      });
      if (tags_search.app.in_focus){
        tags_search.search_suggestions = action.suggestions;
      }
    }
    let new_collections = [
      ...state.collections.slice(0, index),
      collection,
      ...state.collections.slice(index + 1)
    ];
    return {
      ...state,
      collections: new_collections
    };
  }

}


// ------------------------------------
// Reducer
// ------------------------------------

const reducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

export default reducer
