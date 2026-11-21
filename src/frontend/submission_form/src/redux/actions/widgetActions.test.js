import axios from 'axios';
import {saveWidgetData, saveWidgetDataSilently, saveAllUnsavedWidgets, withPersonId} from './widgetActions';
import {WIDGET} from '../../constants';

jest.mock('axios');

const stateWith = (personId, widgets = {}) => ({
    person: {person: {name: 'Jane', personId: personId}},
    paper: {paperData: {paperPasswd: '123.4'}},
    ...widgets
});

beforeEach(() => {
    axios.post.mockReset();
    axios.post.mockResolvedValue({data: {}});
});

test('withPersonId adds the person', () => {
    expect(withPersonId({passwd: 'x'}, stateWith('123'))).toEqual({passwd: 'x', person_id: 'two123'});
});

test('payload person_id is kept', () => {
    expect(withPersonId({person_id: 'two9'}, stateWith('123')).person_id).toBe('two9');
});

test('unidentified user sends twoundefined', () => {
    expect(withPersonId({}, stateWith(undefined)).person_id).toBe('twoundefined');
});

test('saveWidgetData adds person_id', async () => {
    await saveWidgetData({rnai_pheno: 'checked', passwd: 'x'}, WIDGET.PHENOTYPES)(jest.fn(), () => stateWith('123'));
    expect(axios.post.mock.calls[0][1]).toEqual({rnai_pheno: 'checked', passwd: 'x', person_id: 'two123'});
});

test('saveWidgetDataSilently adds person_id', async () => {
    await saveWidgetDataSilently({gene_int: '', passwd: 'x'}, WIDGET.INTERACTIONS)(jest.fn(), () => stateWith('7'));
    expect(axios.post.mock.calls[0][1].person_id).toBe('two7');
});

test('saveAllUnsavedWidgets sends person_id for every widget', async () => {
    const unsaved = {isSavedToDB: false, newAntibodies: {checked: true}};
    const state = stateWith('55', {
        overview: unsaved, genetics: unsaved, reagent: unsaved, expression: unsaved,
        interactions: unsaved, phenotypes: unsaved, disease: unsaved
    });
    await saveAllUnsavedWidgets()(jest.fn(), () => state);
    expect(axios.post.mock.calls.length).toBe(7);
    axios.post.mock.calls.forEach(call => expect(call[1].person_id).toBe('two55'));
});
