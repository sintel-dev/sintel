import argparse

from mtv.explorer import MTVExplorer
from mtv.utils import read_config, setup_logging


def _run(explorer, args):
    if args.module is None:
        explorer.run_server(args.env, args.port)
    else:
        explorer.run_module(args.module, args.args)


def _add_aggdata(explorer, args):
    explorer.add_aggdata(
        args.path,
        args.col,
        args.start,
        args.stop,
        args.timestamp_column,
        args.value_column,
        args.header,
        args.interval
    )


def _update_db(explorer, args):
    explorer.update_db()


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
    update_db.set_defaults(function=_update_db)

    # mtv add
    add = action.add_parser('add', help='Add an object to the database')
    add_model = add.add_subparsers(title='model', dest='model')
    add_model.required = True

    # mtv add aggdata
    add_aggdata = add_model.add_parser('aggdata', parents=[common],
                                       help='Add raw data')
    add_aggdata.set_defaults(function=_add_aggdata)

    add_aggdata.add_argument('-T', '--timestamp-column', type=int, default=0,
                             help='Position of the timestamp column in the CSV')
    add_aggdata.add_argument('-V', '--value-column', type=int, default=1,
                             help='Position of the value column in the CSV')
    add_aggdata.add_argument('-H', '--header', action='store_true',
                             help='Whether having header in the CSV')
    add_aggdata.add_argument('-I', '--interval', type=int, default=30,
                             help='Interval (minute) used for data aggregation.')
    add_aggdata.add_argument(
        '--start',
        type=int,
        help='Start time, as an integer unix timestamp')
    add_aggdata.add_argument(
        '--stop',
        type=int,
        help='Stop time, as an integer unix timestamp')
    add_aggdata.add_argument(
        '--col',
        type=str,
        default='raw',
        help='Collection name')
    add_aggdata.add_argument(
        'path',
        nargs='?',
        help='Path to the csv data directory')

    return parser


def main():

    parser = get_parser()
    args = parser.parse_args()

    setup_logging(args.verbose, args.logfile)
    config = read_config('./mtv/config.yaml')
    explorer = MTVExplorer(config, args.docker)

    args.function(explorer, args)
