import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, MessageContext } from 'lightning/messageService';
import getWorkItemActions from '@salesforce/apex/WorkCardController.getWorkItemActions';
import WORK_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkMessageChannel__c';
import WORK_ITEM_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkItemMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

export default class WorkCardComponent extends NavigationMixin(LightningElement) {
    @track workItemActions = []; // Track this property to ensure reactivity
    @track paginatedWorkItemActions = []; // Paginated list of actions
    @track page = 1;
    @track pageSize = 3; // Default page size
    @track totalPage = 1;

    error;
    workRecordId; // Stores the Work record ID
    selectedActionId; // Stores the Work Item Action record ID
    isModalOpen = false;
    message = 'Select work item to see action items'; // Default message

    wiredResult;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannels();
    }

    subscribeToMessageChannels() {
        this.subscriptionWork = subscribe(
            this.messageContext,
            WORK_MESSAGE_CHANNEL,
            (message) => this.handleWorkMessage(message)
        );

        this.subscriptionWorkItem = subscribe(
            this.messageContext,
            WORK_ITEM_MESSAGE_CHANNEL,
            (message) => this.handleWorkItemMessage(message)
        );
    }

    handleWorkMessage(message) {
        this.workRecordId = message.recordId; // This is the Work record ID
        this.message = undefined; // Clear any existing messages
        this.refreshData(); // Fetch the latest work item actions
    }

    handleWorkItemMessage(message) {
        this.refreshData();
    }

    @wire(getWorkItemActions, { workId: '$workRecordId' })
    wiredWorkItemActions(result) {
        this.wiredResult = result; // Store the wired result for refreshing
        const { data, error } = result;
        if (data) {
            this.workItemActions = data.map(action => ({
                ...action,
                actionUrl: `/ideaexchange/s/work-item-action/${action.Id}/view`
            }));

            if (this.workItemActions.length > 0) {
                this.updatePagination();
                this.message = undefined;
            } else {
                this.message = 'No action items for selected work item';
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.workItemActions = [];
            this.message = 'Error loading action items';
        }
    }

    updatePagination() {
        this.totalPage = Math.ceil(this.workItemActions.length / this.pageSize);
        this.paginate();
    }

    paginate() {
        const start = (this.page - 1) * this.pageSize;
        const end = this.page * this.pageSize;
        this.paginatedWorkItemActions = this.workItemActions.slice(start, end);
    }

    get isPaginationVisible() {
        return this.totalPage > 1;
    }

    get isPreviousDisabled() {
        return this.page === 1;
    }

    get isNextDisabled() {
        return this.page === this.totalPage;
    }

    handlePrevious() {
        if (this.page > 1) {
            this.page -= 1;
            this.paginate();
        }
    }

    handleNext() {
        if (this.page < this.totalPage) {
            this.page += 1;
            this.paginate();
        }
    }

    refreshData() {
        this.workItemActions = [];
        this.error = undefined;

        if (this.wiredResult) {
            refreshApex(this.wiredResult);
        } else {
            this.fetchWorkItemActions();
        }
    }

    fetchWorkItemActions() {
        getWorkItemActions({ workId: this.workRecordId })
            .then(result => {
                this.workItemActions = result.map(action => ({
                    ...action,
                    actionUrl: `/ideaexchange/s/work-item-action/${action.Id}/view`
                }));

                if (this.workItemActions.length > 0) {
                    this.updatePagination();
                    this.message = undefined;
                } else {
                    this.message = 'No action items for selected work item';
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.workItemActions = [];
                this.message = 'Error loading action items';
            });
    }

    handleEditClick(event) {
        const actionRecordId = event.currentTarget.dataset.id;
        const modal = this.template.querySelector('c-work-popup-component');
        
        if (modal) {
            modal.open(actionRecordId);
        } else {
            console.error('Modal component not found in DOM');
        }
    }

    handleModalClose() {
        this.isModalOpen = false;
    }
}
