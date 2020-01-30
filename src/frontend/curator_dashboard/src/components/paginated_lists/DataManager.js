export function getListElements(filters, type, offset, count, endpoint) {
    return new Promise((resolve, reject ) => {
        let svmFilters = "";
        if (filters !== undefined && filters.svmFilters !== undefined) {
            svmFilters = [...filters.svmFilters].join(',');
        }
        let manualFilters = "";
        if (filters !== undefined && filters.manualFilters !== undefined) {
            manualFilters = [...filters.manualFilters].join(',');
        }
        let curationFilters = "";
        if (filters !== undefined && filters.curationFilters !== undefined) {
            curationFilters = [...filters.curationFilters].join(',');
        }
        let listType = "";
        if (type !== undefined) {
            listType = type;
        }
        let payload = {
            from: offset,
            count: count,
            list_type: listType,
            svm_filters: svmFilters,
            manual_filters: manualFilters,
            curation_filters: curationFilters
        };
        fetch(endpoint, {
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
                reject("Error")
            }
        }).then(data => {
            if (data === undefined) {
                reject("Empty response")
            }
            resolve({elements: data["list_elements"], totNumElements: data["total_num_elements"]});
        }).catch((err) => {
            reject(err);
        });
    });
}