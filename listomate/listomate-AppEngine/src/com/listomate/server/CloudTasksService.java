package com.listomate.server;

import java.util.List;

import com.listomate.shared.TaskChange;

public class CloudTasksService {

	static DataStore db = new DataStore();

	public static Task createTask() {
		return db.update(new Task());
	}

	public static Task readTask(Long id) {
		return db.find(id);
	}

	public static Task updateTask(Task task) {
		task.setEmailAddress(DataStore.getUserEmail());
		task = db.update(task);
		DataStore.sendC2DMUpdate(TaskChange.UPDATE + TaskChange.SEPARATOR
				+ task.getId());
		return task;

	}

	public static void deleteTask(Task task) {

		db.delete(task.getId());
	}

	public static List<Task> queryTasks() {
		return db.findAll();
	}

}
