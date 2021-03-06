
from flask import Flask, request, Response, send_from_directory
from flask.json import jsonify
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from models import Point, Collection, Tag
from database import db_engine
import json

app = Flask(__name__)
CORS(app)

Session = sessionmaker(bind=db_engine)


@app.route('/')
def home():
    return send_from_directory('html', '/Users/leosimmons/projects/study/client/index.html')


@app.route('/points')
def get_points():
    collection_mode = request.args.get('collection_mode', None)
    tag_ids = request.args.getlist('tag_id')
    session = Session()
    if collection_mode == 'inclusive':
        tag_instances = session.query(Tag)\
            .filter(Tag.tag_id.in_(tag_ids)).all()
        points = []
        for tag in tag_instances:
            tag_points = [ point.serialize for point in tag.points  ]
            points = points + tag_points
    elif collection_mode == 'exclusive':
        all_point_instances = session.query(Point).all()
        points = []
        for point in all_point_instances:
            point_tag_ids = [str(tag.tag_id) for tag in point.tags ]
            if set(tag_ids).issubset(point_tag_ids):
                points.append(point.serialize)
    else:
        points = [ point.serialize for point in session.query(Point).all() ]
    session.commit()
    return jsonify(points=points)


@app.route('/points', methods=['POST'])
def post_points():
    session = Session()
    new_point_data = request.json
    new_point = Point(**new_point_data['point'])
    try:
        for tag_id in new_point_data['tag_ids']:
            tag = session.query(Tag).get(tag_id)
            new_point.tags.append(tag)
    except KeyError:
        pass
    session.add(new_point)
    session.commit()
    added_point = new_point.serialize
    session.close()
    return jsonify(point=added_point)


@app.route('/collections/<int:collection_id>')
def get_collection(collection_id):
    session = Session()
    collection_instance = session.query(Collection).filter_by(collection_id=collection_id).one()
    collection = collection_instance.serialize
    collection_tags = [ tag.serialize for tag in collection_instance.tags ]
    collection['tags'] = collection_tags
    collection['points'] = []
    for tag in collection_instance.tags:
        tag_points = [ point.serialize for point in tag.points ]
        collection['points'] = collection['points'] + tag_points
    session.commit()
    return jsonify(collection=collection)


@app.route('/collections', methods=['POST'])
def add_collection():
    session = Session()
    session.query(Collection).all()
    post_data = request.json
    new_collection_data = post_data['collection']
    new_collection = Collection(**new_collection_data)
    try:
        tag_instances = session.query(Tag)\
            .filter(Tag.tag_id.in_(post_data['tag_ids']))\
            .all()
        new_collection.tags = new_collection.tags + tag_instances
    except KeyError:
        pass
    session.add(new_collection)
    session.flush()
    added_collection = new_collection.serialize
    session.commit()
    return jsonify(collection=added_collection)


@app.route('/collections/<int:collection_id>', methods=['PUT'])
def update_collection(collection_id):
    session = Session()
    collection = session.query(Collection).get(collection_id)
    if collection is None:
        return 'Collection not found', 404
    put_data = request.json
    for field in put_data['collection']:
        if field == 'mode':
            for mode_name in ['is_tags_inclusive','is_tags_exclusive','is_select_points']:
                if put_data['collection']['mode'][mode_name]:
                    setattr(collection, mode_name, True)
                else:
                    setattr(collection, mode_name, False)
        elif field == 'tag_ids':
            tags = session.query(Tag)\
                .filter(Tag.tag_id.in_(put_data['collection']['tag_ids']))\
                .all()
            collection.tags = collection.tags + tags
        else:
            setattr(collection, field, put_data['collection'][field])
    session.add(collection)
    session.flush()
    updated_collection = collection.serialize
    session.commit()
    return jsonify(collection=updated_collection)


@app.route('/collections/new')
def get_new_collection():
    session = Session()
    session.query(Collection).all()
    new_collection_data = {'name': 'new_collection'}
    new_collection = Collection(**new_collection_data)
    session.add(new_collection)
    session.flush()
    added_collection = new_collection.serialize
    added_collection['points'] = []
    session.commit()
    return jsonify(new_collection=added_collection)


@app.route('/collections/search/<string:value>')
def search_collections(value):
    session = Session()
    suggested_collections = session.query(Collection)\
        .filter(Collection.name.ilike('%'+value+'%')).all()
    suggestions = [ { 'collection_id': c.collection_id, 'name': c.name } for c in suggested_collections ]
    session.commit()
    return jsonify(suggestions=suggestions)


@app.route('/tags', methods=['POST'])
def post_tag():
    session = Session()
    tag_data = request.json
    tag = Tag(**tag_data['tag'])
    session.add(tag)
    session.commit()
    added_tag = tag.serialize
    session.commit()
    return jsonify(tag=added_tag)


@app.route('/tags/search/<string:value>')
def search_tags(value):
    session = Session()
    suggested_tags = session.query(Tag)\
        .filter(Tag.name.ilike('%'+value+'%')).all()
    suggestions = [ { 'tag_id': c.tag_id, 'name': c.name } for c in suggested_tags ]
    session.commit()
    return jsonify(suggestions=suggestions)


if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
