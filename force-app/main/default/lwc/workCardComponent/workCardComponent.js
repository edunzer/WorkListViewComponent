import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, MessageContext } from 'lightning/messageService';
import getWorkItemActions from '@salesforce/apex/WorkCardController.getWorkItemActions';
import WORK_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkMessageChannel__c';

export default class WorkCardComponent extends NavigationMixin(LightningElement) {
    workItemActions = [];
    error;
    recordId;
    message = 'Select work item to see action items';

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            WORK_MESSAGE_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        this.recordId = message.recordId;
        this.fetchWorkItemActions();
    }

    @wire(getWorkItemActions, { workId: '$recordId' })
    wiredWorkItemActions({ error, data }) {
        if (data && data.length > 0) {
            this.workItemActions = data.map(action => ({
                ...action,
                actionUrl: `/ideaexchange/s/work-item-action/${action.Id}/view`
            }));
            this.message = undefined;
            this.error = undefined;
        } else if (data && data.length === 0) {
            this.workItemActions = [];
            this.message = 'No action items for selected work item';
        } else if (error) {
            this.error = error;
            this.workItemActions = [];
        }
    }

    fetchWorkItemActions() {
        getWorkItemActions({ workId: this.recordId })
            .then(result => {
                if (result.length > 0) {
                    this.workItemActions = result.map(action => ({
                        ...action,
                        actionUrl: `/ideaexchange/s/work-item-action/${action.Id}/view`
                    }));
                    this.message = undefined;
                } else {
                    this.workItemActions = [];
                    this.message = 'No action items for selected work item';
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.workItemActions = [];
                this.message = undefined;
            });
    }

    handleViewClick(event) {
        const url = event.currentTarget.dataset.url;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}
