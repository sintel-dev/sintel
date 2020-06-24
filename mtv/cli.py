import argparse

from mtv.core import MTV
from mtv.utils import read_config, setup_logging


def _run(explorer, args):
    if args.module is None:
        explorer.run_server(args.env, args.port)
    else:
        explorer.run_module(args.module, args.args)


def _update_db(explorer, args):
    explorer.update_db(args.utc)


def get_parser():

    # Common Parent - Shared options
    common = argparse.ArgumentParser(add_help=False)

    common.add_argument('-l', '--logfile',
                        help='Name of the logfile.'
                             'If not given, log to stdout.')

    common.add_argument('-v', '--verbose', action='count', default=0,
                        help='Be verbose. Use -vv for increased verbosity.')

    common.add_argument('--docker', action='store_true',
                        help='deployed in docker environment')

    parser = argparse.ArgumentParser(description='MTV Command Line Interface.')
    parser.set_defaults(function=None)

    # mtv [action]
    action = parser.add_subparsers(title='action', dest='action')
    action.required = True

    # mtv run
    run = action.add_parser('run', help='Start flask server', parents=[common])
    run.set_defaults(function=_run)

    run.add_argument('-P', '--port', type=int, help='Flask server port')
    run.add_argument('-E', '--env', type=str, help='Flask environment')
    run.add_argument('-m', '--module', type=str, help='Run a specific module'
                     'with main() function')
    run.add_argument('--args', nargs='*', default=[], type=str,
                     help='The args to the main()')

    # mtv update
    update = action.add_parser('update', help='update action')
    update_model = update.add_subparsers(title='model', dest='model')
    update_model.required = True

    # mtv update db
    update_db = update_model.add_parser('db', parents=[common],
                                        help='Add raw data')
    update_db.add_argument('--utc', action='store_true',
                           help='whether to use UTC time')
    update_db.set_defaults(function=_update_db)

    # mtv add
    add = action.add_parser('add', help='Add an object to the database')
    add_model = add.add_subparsers(title='model', dest='model')
    add_model.required = True

    # mtv add aggdata
    # add_aggdata = add_model.add_parser('aggdata', parents=[common],
    #                                    help='Add raw data')
    # add_aggdata.set_defaults(function=_add_aggdata)

    return parser


def main():

    parser = get_parser()
    args = parser.parse_args()

    setup_logging(args.verbose, args.logfile)
    config = read_config('./mtv/config.yaml')
    explorer = MTV(config, args.docker)

    args.function(explorer, args)
