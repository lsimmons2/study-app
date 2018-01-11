import { connect } from 'react-redux'
import { search, get_focused_array_item } from '../modules'
import _ from 'underscore'
import Search from '../components/Search'



const mapDispatchToProps = {
  search
}

const mapStateToProps = (globalState) => {
  let collection = get_focused_array_item(globalState.points.tabs);
  let sections = collection.app.views.new_point.sections;
  let tags_search = _.find(sections, section => {
    return section.name === 'tags_search'
  });
  return {
    in_focus: tags_search.in_focus,
    search_suggestions: tags_search.search_suggestions,
    search_type: 'tags'
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
