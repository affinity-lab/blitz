import {scopeEnum} from "@affinity-lab/util";

export enum BLITZ_EVENTS {
	BEFORE_INSERT = "BEFORE_INSERT",
	AFTER_INSERT = "AFTER_INSERT",
	BEFORE_UPDATE = "BEFORE_UPDATE",
	AFTER_UPDATE = "AFTER_UPDATE",
	BEFORE_DELETE = "BEFORE_DELETE",
	AFTER_DELETE = "AFTER_DELETE",
	STORAGE_DESTROY = "STORAGE_DESTROY",
	STORAGE_DELETE = "STORAGE_DELETE",
	STORAGE_RENAME = "STORAGE_RENAME",
}

scopeEnum(BLITZ_EVENTS, "BLITZ_EVENTS");
