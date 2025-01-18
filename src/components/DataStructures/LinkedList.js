import { ListNode } from './ListNode';

export class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(char) {
        const newNode = new ListNode(char);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.length++;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
}