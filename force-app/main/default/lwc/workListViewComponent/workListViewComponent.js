import { LightningElement, wire } from 'lwc';
import getWorkRecords from '@salesforce/apex/WorkListViewController.getWorkRecords';
import { publish, MessageContext } from 'lightning/messageService';
import WORK_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkMessageChannel__c';

const columns = [
    { label: 'Work Id', fieldName: 'workUrl', type: 'url', 
      typeAttributes: { label: { fieldName: 'Name' }}},
    { label: 'Subject', fieldName: 'agf__Subject__c' },
    { label: 'Status', fieldName: 'agf__Status__c' },
    { label: 'Scheduled Build', fieldName: 'scheduledBuildUrl', type: 'url', 
      typeAttributes: { label: { fieldName: 'scheduledBuildName' }}},
    { label: 'Assigned To', fieldName: 'assigneeUrl', type: 'url', 
      typeAttributes: { label: { fieldName: 'assigneeName' }}}
];

export default class WorkListViewComponent extends LightningElement {
    columns = columns;
    workRecords;

    @wire(MessageContext)
    messageContext;

    @wire(getWorkRecords)
    wiredWorkRecords({ error, data }) {
        if (data) {
            this.workRecords = data.map(record => {
                return {
                    ...record,
                    workUrl: `/ideaexchange/s/adm-work/${record.Id}`,
                    scheduledBuildUrl: record.agf__Scheduled_Build__c ? `/ideaexchange/s/adm-build/${record.agf__Scheduled_Build__c}` : null,
                    scheduledBuildName: record.agf__Scheduled_Build__r ? record.agf__Scheduled_Build__r.Name : 'N/A',
                    assigneeUrl: record.agf__Assignee__c ? `/ideaexchange/s/profile/${record.agf__Assignee__c}` : null,
                    assigneeName: record.agf__Assignee__r ? record.agf__Assignee__r.Name : 'N/A'
                };
            });
        } else if (error) {
            this.workRecords = undefined;
            console.error('Error fetching work records:', error);
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
