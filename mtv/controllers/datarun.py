import logging

from flask import request
from flask_restful import Resource

from mtv import model

LOGGER = logging.getLogger(__name__)


class Datarun(Resource):
    def get(self, datarun):
        """ GET /api/v1/dataruns/<datarun:string>/ """

    def delete(self, datarun):
        """ DEL /api/v1/dataruns/<datarun:string>/ """
        return 'delete'

    def put(self, datarun):
        """ PUT /api/v1/dataruns/<datarun:string>/ """
        return 'put'


class Dataruns(Resource):
    def get(self):
        """ Return datarun list of a given dataset. If the dataset is not
            specified, return all dataruns.

        GET /api/v1/dataruns/dataset?=xxx
        """

        dataset = request.args.get('dataset', None)

        if (dataset is not None):
            # Return datarun list of a given dataset

            document = model.Dataset.find_one(name=dataset)

            if document is None:
                return []

            dataset_id = document.id

            query = {
                'dataset': dataset_id
            }

            documents = model.Datarun.find(**query)

            docs = list()
            for document in documents:
                docs.append({
                    'id': str(document.id),
                    'insert_time': document.insert_time.isoformat(),
                    'start_time': document.start_time.isoformat(),
                    'end_time': document.end_time.isoformat(),
                    'status': document.status,
                    'created_by': document.created_by,
                    'events': document.events,
                    'pipeline': str(document.pipeline.id)
                })

            return docs

        else:
            # Return all
            dataset_docs = model.Dataset.find()

            if dataset_docs is None:
                return []

            docs = list()

            for dataset_doc in dataset_docs:
                dataset_id = dataset_doc.id

                query = {
                    'dataset': dataset_id
                }

                documents = model.Datarun.find(**query)

                for document in documents:
                    docs.append({
                        'id': str(document.id),
                        'insert_time': document.insert_time.isoformat(),
                        'start_time': document.start_time.isoformat(),
                        'end_time': document.end_time.isoformat(),
                        'status': document.status,
                        'created_by': document.created_by,
                        'events': document.events,
                        'pipeline': str(document.pipeline.id)
                    })

            return docs
