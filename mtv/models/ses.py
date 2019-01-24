
turnover = conn_mongo['crm_turnover_agg']
customer = conn_mongo['crm_customer']


def fetchDBSpecificData(options):
    # zone_statistics

    # result = []
    # count = 0
    # cond = {'product': 'Filter'}
    # proj = {'_id': 0}
    # for doc in col.find(cond, proj).sort('date'):
    #     result.append(doc)
    #     pprint(doc)
    #     count += 1
    #     if (count > 5):
    #         return result
    return 0


def fetchSignalData(options):
    raw_data = []
    cond = {}
    proj = {'_id': 0, 'state': 1, 'date': 1, 'product': 1, 'turnover': 1}
    for doc in turnover.find(cond, proj):
        raw_data.append(doc)
    return TensorCRM(raw_data, options)
