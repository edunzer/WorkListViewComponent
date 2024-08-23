import { LightningElement, wire, track } from 'lwc';
import getWorkRecords from '@salesforce/apex/WorkListViewController.getWorkRecords';
import { publish, MessageContext } from 'lightning/messageService';
import WORK_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkMessageChannel__c';

const columns = [
    { label: 'Work Id', fieldName: 'workUrl', type: 'url', 
      typeAttributes: { label: { fieldName: 'Name' }}},
    { label: 'Subject', fieldName: 'agf__Subject__c' },
    { label: 'Status', fieldName: 'agf__Status__c' },
    { label: 'Build Release Date', fieldName: 'buildReleaseDate', type: 'date' }, // Displaying the date directly
    { label: 'Assigned To', fieldName: 'assigneeUrl', type: 'url', 
      typeAttributes: { label: { fieldName: 'assigneeName' }}}
];

export default class WorkListViewComponent extends LightningElement {
    @track columns = columns;
    @track workRecords;
    @track page = 1;
    @track pageSize = 10; // Number of records per page
    @track totalRecords;
    @track totalPage;

    @wire(MessageContext)
    messageContext;

    @wire(getWorkRecords, { pageSize: '$pageSize', pageNumber: '$page' })
    wiredWorkRecords({ error, data }) {
        if (data) {
            this.totalRecords = data.totalRecords;
            this.updateTotalPages();
            this.workRecords = data.workRecords.map(record => {
                return {
                    ...record,
                    workUrl: `/ideaexchange/s/adm-work/${record.Id}`,
                    scheduledBuildUrl: record.agf__Scheduled_Build__c ? `/ideaexchange/s/adm-build/${record.agf__Scheduled_Build__c}` : null,
                    buildReleaseDate: record.Scheduled_Build_Release_Date__c ? record.Scheduled_Build_Release_Date__c : 'N/A', // Correctly display the date
                    assigneeUrl: record.agf__Assignee__c ? `/ideaexchange/s/profile/${record.agf__Assignee__c}` : null,
                    assigneeName: record.agf__Assignee__r ? record.agf__Assignee__r.Name : 'N/A'
                };
            });
        } else if (error) {
            this.workRecords = undefined;
            console.error('Error fetching work records:', error);
        }
    }

    updateTotalPages() {
        this.totalPage = Math.ceil(this.totalRecords / this.pageSize);
    }

    get isPreviousDisabled() {
        return this.page <= 1;
    }

    get isNextDisabled() {
        return this.page >= this.totalPage;
    }

    handlePrevious() {
        if (this.page > 1) {
            this.page -= 1;
        }
    }

    handleNext() {
        if (this.page < this.totalPage) {
            this.page += 1;
        }
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        if (selectedRows.length > 0) {
            const selectedRecord = selectedRows[0]; // Assuming single selection for simplicity
            const message = {
                recordId: selectedRecord.Id,
                subject: selectedRecord.agf__Subject__c
            };
            publish(this.messageContext, WORK_MESSAGE_CHANNEL, message);
        } else {
            const message = {
                recordId: null,
                subject: null
            };
            publish(this.messageContext, WORK_MESSAGE_CHANNEL, message);
        }
    }
}
