import argparse
from mtv.explorer import MTVExplorer
from mtv.utils import setup_logging


def _run(explorer, args):
    explorer.run_server(args.env, args.port)

def get_parser():
    
    # Common Parent - Shared options
    common = argparse.ArgumentParser(add_help=False)

    common.add_argument('-D', '--database', default='mtv',
                        help='Name of the database to connect to. '
                             'Defaults to "mtv"')

    common.add_argument('-l', '--logfile',
                        help='Name of the logfile.'
                             'If not given, log to stdout.')

    common.add_argument('-v', '--verbose', action='count', default=0,
                        help='Be verbose. Use -vv for increased verbosity.')

    parser = argparse.ArgumentParser(description='MTV Command Line Interface.')
    parser.set_defaults(function=None)

    # mtv [action]
    action = parser.add_subparsers(title='action', dest='action')
    action.required = True

    # mtv run
    server = action.add_parser('run', help='run server', parents=[common])
    server.set_defaults(function=_run)

    server.add_argument('-P', '--port', default=3000, type=int,
                             help='flask server port')
    server.add_argument('-E', '--env', default='development', type=str,
                             help='running environment')   

    # mtv process xxx
    # TODO: preprocess data

    return parser


def main():

    parser = get_parser()
    args = parser.parse_args()

    setup_logging(args.verbose, args.logfile)
    explorer = MTVExplorer(args.database)

    args.function(explorer, args)
