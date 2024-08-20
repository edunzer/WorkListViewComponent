import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, MessageContext } from 'lightning/messageService';
import getWorkItemActions from '@salesforce/apex/WorkCardController.getWorkItemActions';
import WORK_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkMessageChannel__c';
import WORK_ITEM_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkItemMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

export default class WorkCardComponent extends NavigationMixin(LightningElement) {
    @track workItemActions = []; // Track this property to ensure reactivity
    error;
    workRecordId; // Stores the Work record ID
    selectedActionId; // Stores the Work Item Action record ID
    isModalOpen = false;
    message = 'Select work item to see action items'; // Default message

    wiredResult;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        console.log('WorkCardComponent connected.');
        this.subscribeToMessageChannels();
    }

    subscribeToMessageChannels() {
        this.subscriptionWork = subscribe(
            this.messageContext,
            WORK_MESSAGE_CHANNEL,
            (message) => this.handleWorkMessage(message)
        );
        console.log('Subscribed to WorkMessageChannel');

        this.subscriptionWorkItem = subscribe(
            this.messageContext,
            WORK_ITEM_MESSAGE_CHANNEL,
            (message) => this.handleWorkItemMessage(message)
        );
        console.log('Subscribed to WorkItemMessageChannel');
    }

    handleWorkMessage(message) {
        console.log('Message received in workCardComponent from WorkMessageChannel:', message);
        this.workRecordId = message.recordId; // This is the Work record ID
        this.message = undefined; // Clear any existing messages
        this.refreshData(); // Fetch the latest work item actions
    }

    handleWorkItemMessage(message) {
        console.log('Message received in workCardComponent from WorkItemMessageChannel:', message);
        // Ensure the correct Work record data is refreshed
        this.refreshData();
    }

    @wire(getWorkItemActions, { workId: '$workRecordId' })
    wiredWorkItemActions(result) {
        this.wiredResult = result; // Store the wired result for refreshing
        const { data, error } = result;
        if (data) {
            if (data.length > 0) {
                this.workItemActions = data.map(action => ({
                    ...action,
                    actionUrl: `/ideaexchange/s/work-item-action/${action.Id}/view`
                }));
                this.message = undefined;
            } else {
                this.workItemActions = [];
                this.message = 'No action items for selected work item';
            }
            this.error = undefined;
            console.log('Updated workItemActions:', this.workItemActions);
        } else if (error) {
            this.error = error;
            this.workItemActions = [];
            this.message = 'Error loading action items';
        }
    }

    refreshData() {
        // Clear the existing data to force a re-render
        this.workItemActions = [];
        this.error = undefined;

        // Explicitly refresh the wired data
        if (this.wiredResult) {
            refreshApex(this.wiredResult);
            console.log('Data refreshed via refreshApex.');
        } else {
            // Fallback in case refreshApex is not applicable
            this.fetchWorkItemActions();
        }
    }

    fetchWorkItemActions() {
        console.log('Fetching work item actions for recordId:', this.workRecordId);
        getWorkItemActions({ workId: this.workRecordId })
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
                console.log('Fetched workItemActions:', this.workItemActions);
            })
            .catch(error => {
                console.error('Error fetching work item actions:', error);
                this.error = error;
                this.workItemActions = [];
                this.message = 'Error loading action items';
            });
    }

    handleEditClick(event) {
        const actionRecordId = event.currentTarget.dataset.id;
        console.log('View button clicked for recordId:', actionRecordId);
        const modal = this.template.querySelector('c-work-popup-component');
        
        if (modal) {
            modal.open(actionRecordId);
            console.log('Modal opened for recordId:', actionRecordId);
        } else {
            console.error('Modal component not found in DOM');
        }
    }

    handleModalClose() {
        this.isModalOpen = false;
        console.log('Modal closed.');
    }
}
