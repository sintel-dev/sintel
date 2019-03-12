import argparse
from mtv.explorer import MTVExplorer
from mtv.utils import setup_logging, read_config


def _run(explorer, args):
    explorer.run_server(args.env, args.port)

def _add_rawdata(explorer, args):
    explorer.add_rawdata(args.col, args.path)

def get_parser():
    
    # Common Parent - Shared options
    common = argparse.ArgumentParser(add_help=False)

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
    run = action.add_parser('run', help='Start flask server', parents=[common])
    run.set_defaults(function=_run)

    run.add_argument('-P', '--port', type=int, help='Flask server port')
    run.add_argument('-E', '--env', type=str, help='Flask environment')   

    # mtv add
    add = action.add_parser('add', help='Add an object to the database')
    add_model = add.add_subparsers(title='model', dest='model')
    add_model.required = True
    
    # mtv add rawdata
    add_rawdata = add_model.add_parser('rawdata', parents=[common],
                                       help='Add raw data to the database')
    add_rawdata.set_defaults(function=_add_rawdata)

    add_rawdata.add_argument('--col', default='raw', help='Collection name')
    add_rawdata.add_argument('--path', required=True, 
                             help='Path to the folder storing the raw data')

    return parser


def main():

    parser = get_parser()
    args = parser.parse_args()
    
    setup_logging(args.verbose, args.logfile)
    config = read_config('./mtv/config.yaml')
    explorer = MTVExplorer(config)

    args.function(explorer, args)
