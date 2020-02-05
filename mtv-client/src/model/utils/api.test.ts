import API from './api';

describe('Should fetch data from server', () => {
  it('Datasets', async () => {
    const oneDataset = await API.datasets.find('SMAP_set3');
    expect(oneDataset).toHaveProperty('insert_time');

    const datasets = await API.datasets.all();
    expect(datasets.datasets).toHaveLength(8);
  });

  it('Events', async () => {
    // create
    const creatingEvent = {
      datarun_id: '5da7cc6576e3e19307d0db65',
      start_time: 1228219200,
      stop_time: 1229299200,
      score: 1.1,
      tag: 'problem',
    };
    let event = await API.events.create(creatingEvent);
    expect(event.score).toBe(1.1);

    // get event by event ID
    event = await API.events.find(event.id);
    expect(event.score).toBe(1.1);

    // update
    const updatingEvent = {
      start_time: 1228219201,
      stop_time: 1229299201,
      score: 1.99,
      tag: 'normal',
    };
    event = await API.events.update(event.id, updatingEvent);
    expect(event.score).toBe(1.99);

    // get events by datarun ID
    let res = await API.events.all({}, { datarun_id: '5da7cc6576e3e19307d0db65' });
    expect(res.events).toBeInstanceOf(Array);

    // delete
    let res2 = await API.events.delete(event.id);
    expect(res2).toBe(200);
  });
});
