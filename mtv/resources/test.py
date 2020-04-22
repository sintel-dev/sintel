import logging

from flask_restful import Resource
from flask import Flask, request, redirect, url_for
from mtv.resources.auth_utils import verify_auth

LOGGER = logging.getLogger(__name__)


class Test(Resource):
    def get(self):
        """
        @api {get} /test/ Test get
        @apiGroup Test
        @apiVersion 1.0.0
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'auth pass'}, 200

    def post(self):
        """
        @api {post} /test/ Test post
        @apiGroup Test
        @apiVersion 1.0.0
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'post'}, 200, {'username': 'dyu'}

    def delete(self):
        """
        @api {delete} /test/ Test delete
        @apiGroup Test
        @apiVersion 1.0.0
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'delete'}, 200, {'username': 'dyu'}

    def put(self):
        """
        @api {put} /test/ Test put
        @apiGroup Test
        @apiVersion 1.0.0
        """

        res, status = verify_auth()
        if status == 401:
            return res, status
        return {'message': 'put'}, 200, {'username': 'dyu'}
