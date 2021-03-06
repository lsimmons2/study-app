import uuid from 'uuid/v4'


const get_new_point_view = () => ({
  in_focus: false,
  sections: [
    {
      name: 'point_question_input',
      in_focus: true,
      input_id: uuid()
    },
    {
      name: 'point_answer_input',
      in_focus: false,
      input_id: uuid()
    },
    {
      name: 'tags_list',
      tags: [],
      in_focus: false
    },
    {
      name: 'tag_form',
      in_focus: false,
      input_id: uuid()
    },
    {
      name: 'tags_search',
      search_suggestions: [],
      in_focus: false,
      input_id: uuid()
    }
  ]
})

export const get_just_add_points = () => {
  let new_point = get_new_point_view();
  new_point.in_focus = true;
  return {
    name: 'just add points',
    app: {
      in_focus: true,
      is_just_add_points: true,
      views: {
        new_point
      }
    }
  }
}

export const get_blank_tab = () => ({
  name: 'blank tab',
  app: {
    in_focus: true,
    is_blank: true,
    sections: [
      {
        name: 'collection_search',
        in_focus: true,
        search_suggestions: [],
        input_id: uuid()
      },
      {
        name: 'collection_name_form',
        in_focus: false,
        input_id: uuid()
      },
      {
        name: 'just_add_points_button',
        in_focus: false
      }
    ]
  }
})

const initialState = {
  global: {
    alert: '',
    most_recent_tags: [],
    most_recent_collections: []
  },
  tabs: [get_blank_tab()]
}

export const get_default_collection = () => ({
  name: 'new_collection',
  collection_id: 1,
  points: [],
  tags: [],
  mode: {
    is_tags_exclusive: false,
    is_tags_inclusive: true,
    is_select_points: false
  },
  app: {
    is_collection: true,
    tags: {
      associated: [],
      most_recent: [],
    },
    is_saved: false,
    in_focus: true,
    filter: {
      success_rate: 0,
      time_added: {
        before: null,
        after: null
      }
    },
    sorts: {
      shuffle: true,
      time_added: false
    },
    views: {

      //VIEW: POINT_LIST
      point_list: {
        in_focus: false,
        points: []
      },

      //VIEW: NEW_POINT
      new_point: get_new_point_view(),

      //VIEW: COLLECTION_EDITOR
      collection_editor: {
        in_focus: false,
        sections: [
          {
            name: 'mode_form',
            selected_mode: '',
            in_focus: true
          },
          {
            name: 'tags_list',
            in_focus: false
          },
          {
            name: 'tag_form',
            in_focus: false
          },
          {
            name: 'tags_search',
            search_suggestions: [],
            in_focus: false,
            input_id: uuid()
          },
          {
            name: 'save_button',
            in_focus: false
          }
        ]
      }

    }
  }
})

export default initialState
