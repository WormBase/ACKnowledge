class DataManager {
    constructor(payload, endpoint) {
        this.entitiesList = undefined;
        this.entitiesNum = undefined;
        this.endpoint = endpoint;
    }

    loadDataFromAPI(payload) {
        fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Error")
            }
        }).then(data => {
            if (data === undefined) {
                alert("Empty response")
            }
            this.entitiesList = data["list_ids"];
            this.entitiesNum = data["total_num_ids"];
        }).catch((err) => {
            alert(err);
        });
    }

    get getNumEntities() {
        return this.entitiesNum;
    }

    get getListEntities() {
        return this.entitiesList;
    }
}