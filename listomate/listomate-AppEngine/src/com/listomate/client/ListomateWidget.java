/*
 * Copyright 2011 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.listomate.client;

import com.google.gwt.animation.client.Animation;
import com.google.gwt.cell.client.ButtonCell;
import com.google.gwt.cell.client.CheckboxCell;
import com.google.gwt.cell.client.DatePickerCell;
import com.google.gwt.cell.client.FieldUpdater;
import com.google.gwt.cell.client.TextCell;
import com.google.gwt.core.client.GWT;
import com.google.gwt.core.client.Scheduler;
import com.google.gwt.core.client.Scheduler.RepeatingCommand;
import com.google.gwt.dom.client.Element;
import com.google.gwt.dom.client.Style.Unit;
import com.google.gwt.event.dom.client.KeyCodes;
import com.google.gwt.event.dom.client.KeyUpEvent;
import com.google.gwt.event.dom.client.KeyUpHandler;
import com.google.gwt.event.shared.EventBus;
import com.google.gwt.event.shared.SimpleEventBus;
import com.google.gwt.i18n.client.DateTimeFormat;
import com.google.gwt.i18n.client.DateTimeFormat.PredefinedFormat;
import com.google.gwt.safehtml.shared.SafeHtml;
import com.google.gwt.safehtml.shared.SafeHtmlBuilder;
import com.google.gwt.safehtml.shared.SafeHtmlUtils;
import com.google.gwt.text.shared.SafeHtmlRenderer;
import com.google.gwt.uibinder.client.UiBinder;
import com.google.gwt.uibinder.client.UiField;
import com.google.gwt.user.cellview.client.CellTable;
import com.google.gwt.user.cellview.client.Column;
import com.google.gwt.user.cellview.client.RowStyles;
import com.google.gwt.user.client.ui.Composite;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.view.client.ListDataProvider;
import com.google.gwt.view.client.Range;
import com.google.web.bindery.requestfactory.shared.Receiver;

import com.listomate.shared.CloudTasksRequestFactory;
import com.listomate.shared.NoteProxy;
import com.listomate.shared.NoteRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

public class ListomateWidget extends Composite {

	interface Binder extends UiBinder<Widget, ListomateWidget> {
	}

	public static final Comparator<? super NoteProxy> TASK_COMPARATOR = new Comparator<NoteProxy>() {
		public int compare(NoteProxy t0, NoteProxy t1) {
			// Sort uncompleted tasks above completed tasks
			if (isDone(t0) && !isDone(t1)) {
				return 1;
			} else if (!isDone(t0) && isDone(t1)) {
				return -1;
			} else {
				// Sort tasks by due date within each group
				return compareDueDate(t0, t1);
			}
		}

		boolean isDone(NoteProxy t) {
			Boolean done = t.isDone();
			return done != null && done;
		}

		int compareDueDate(NoteProxy t0, NoteProxy t1) {
			Date d0 = t0.getDueDate();
			Date d1 = t1.getDueDate();

			if (d0 == null) {
				if (d1 == null) {
					return 0;
				} else {
					return -1;
				}
			} else if (d1 == null) {
				return 1;
			}
			long delta = d0.getTime() - d1.getTime();
			if (delta < 0) {
				return -1;
			} else if (delta > 0) {
				return 1;
			} else {
				return 0;
			}
		}
	};

	public static class TasksTable extends CellTable<NoteProxy> {

		public Column<NoteProxy, Date> dateColumn;
		public Column<NoteProxy, String> deleteColumn;
		public Column<NoteProxy, Boolean> doneColumn;
		public Column<NoteProxy, String> nameColumn;

		interface TasksTableResources extends CellTable.Resources {
			@Source("TasksTable.css")
			TableStyle cellTableStyle();
		}

		interface TableStyle extends CellTable.Style {
			String columnCheckbox();

			String columnName();

			String columnDate();

			String columnTrash();
		}

		private static TasksTableResources resources = GWT
				.create(TasksTableResources.class);

		public TasksTable() {
			super(20, resources);

			doneColumn = new Column<NoteProxy, Boolean>(new CheckboxCell()) {
				@Override
				public Boolean getValue(NoteProxy object) {
					return object.isDone() == Boolean.TRUE;
				}
			};
			addColumn(doneColumn, "\u2713"); // Checkmark
			addColumnStyleName(0, resources.cellTableStyle().columnCheckbox());

			nameColumn = new Column<NoteProxy, String>(new TextCell()) {
				@Override
				public String getValue(NoteProxy object) {
					return object.getName();
				}
			};
			addColumn(nameColumn, "Name");
			addColumnStyleName(1, "columnFill");
			addColumnStyleName(1, resources.cellTableStyle().columnName());

			dateColumn = new Column<NoteProxy, Date>(new DatePickerCell(
					DateTimeFormat.getFormat(PredefinedFormat.MONTH_ABBR_DAY))) {
				@Override
				public Date getValue(NoteProxy task) {
					Date dueDate = task.getDueDate();
					return dueDate == null ? new Date() : dueDate;
				}
			};
			addColumn(dateColumn, "Due Date");
			addColumnStyleName(2, resources.cellTableStyle().columnDate());

			ButtonCell buttonCell = new ButtonCell(
					new SafeHtmlRenderer<String>() {
						public SafeHtml render(String object) {
							return SafeHtmlUtils
									.fromTrustedString("<img src=\"delete.png\"></img>");
						}

						public void render(String object,
								SafeHtmlBuilder builder) {
							builder.append(render(object));
						}
					});

			deleteColumn = new Column<NoteProxy, String>(buttonCell) {
				@Override
				public String getValue(NoteProxy object) {
					return "\u2717"; // Ballot "X" mark
				}
			};
			addColumn(deleteColumn, "\u2717");
			addColumnStyleName(3, resources.cellTableStyle().columnTrash());
		}
	}

	class AndroidAnimation extends Animation {
		private static final int TOP = -50;
		private static final int BOTTOM = 150;
		Element element;

		public AndroidAnimation(Element element) {
			this.element = element;
		}

		@Override
		protected void onStart() {
			element.getStyle().setTop(TOP, Unit.PX);
		}

		@Override
		protected void onUpdate(double progress) {
			element.getStyle().setTop(
					TOP + (BOTTOM - TOP) * interpolate(progress), Unit.PX);
		}

		@Override
		protected void onComplete() {
			element.getStyle().setTop(TOP, Unit.PX);
		}
	}

	private static final int DELAY_MS = 1000;

	private static Binder uiBinder = GWT.create(Binder.class);

	@UiField
	Label signin;

	@UiField
	TextBox taskInput;

	@UiField
	TasksTable tasksTable;

	private final EventBus eventBus = new SimpleEventBus();
	private final CloudTasksRequestFactory requestFactory = GWT
			.create(CloudTasksRequestFactory.class);
	private List<NoteProxy> tasksList;

	public ListomateWidget() {
		initWidget(uiBinder.createAndBindUi(this));

		requestFactory.initialize(eventBus);

		ListDataProvider<NoteProxy> listDataProvider = new ListDataProvider<NoteProxy>();
		listDataProvider.addDataDisplay(tasksTable);
		tasksList = listDataProvider.getList();

		Element androidElement = getElement().getFirstChildElement()
				.getFirstChildElement();
		final Animation androidAnimation = new AndroidAnimation(androidElement);

		tasksTable.setRowStyles(new RowStyles<NoteProxy>() {
			public String getStyleNames(NoteProxy row, int rowIndex) {
				Range visibleRange = tasksTable.getVisibleRange();
				int lastRow = visibleRange.getStart()
						+ visibleRange.getLength() - 1;
				if (rowIndex == tasksList.size() - 1 || rowIndex == lastRow) {
					return isDone(row) ? "task complete last"
							: "task incomplete last";
				} else {
					return isDone(row) ? "task complete" : "task incomplete";
				}
			}
		});

		tasksTable.dateColumn
				.setFieldUpdater(new FieldUpdater<NoteProxy, Date>() {
					public void update(int index, NoteProxy task, Date value) {
						NoteRequest request = requestFactory.taskRequest();
						NoteProxy updatedTask = request.edit(task);
						updatedTask.setDueDate(value);
						request.updateNote(updatedTask).fire();
					}
				});

		tasksTable.doneColumn
				.setFieldUpdater(new FieldUpdater<NoteProxy, Boolean>() {
					public void update(int index, NoteProxy task, Boolean value) {
						NoteRequest request = requestFactory.taskRequest();
						NoteProxy updatedTask = request.edit(task);
						updatedTask.setDone(value);
						request.updateNote(updatedTask).fire();
					}
				});

		tasksTable.deleteColumn
				.setFieldUpdater(new FieldUpdater<NoteProxy, String>() {
					public void update(int index, NoteProxy task, String value) {
						NoteRequest request = requestFactory.taskRequest();
						request.deleteNote(task).fire();
						tasksList.remove(task);
					}
				});

		taskInput.getElement().setPropertyString("placeholder",
				"Add new tasks here");

		taskInput.addKeyUpHandler(new KeyUpHandler() {
			public void onKeyUp(KeyUpEvent event) {
				if (event.getNativeKeyCode() == KeyCodes.KEY_ENTER) {
					String message = taskInput.getText();
					taskInput.setText("");
					sendNewTaskToServer(message);

					androidAnimation.run(400);
				}
			}
		});

		Scheduler.get().scheduleFixedDelay(new RepeatingCommand() {
			public boolean execute() {
				retrieveTasks();
				return true;
			}
		}, DELAY_MS);
	}

	boolean isDone(NoteProxy t) {
		Boolean done = t.isDone();
		return done != null && done;
	}

	private void retrieveTasks() {
		requestFactory.taskRequest().queryNotes()
				.fire(new Receiver<List<NoteProxy>>() {
					@Override
					public void onSuccess(List<NoteProxy> tasks) {
						if (tasks.size() > 0) {
							signin.setText("Logged in as "
									+ tasks.get(0).getEmailAddress());
						}

						// sort first
						ArrayList<NoteProxy> sortedTasks = new ArrayList<NoteProxy>(
								tasks);
						Collections.sort(sortedTasks, TASK_COMPARATOR);

						tasksList.clear();
						for (NoteProxy task : sortedTasks) {
							tasksList.add(task);
						}
					}
				});
	}

	/**
	 * Send a task to the server.
	 */
	private void sendNewTaskToServer(String message) {
		NoteRequest request = requestFactory.taskRequest();
		NoteProxy task = request.create(NoteProxy.class);
		int len = Math.min(message.length(), 50);
		if (len != message.length()) {
			message = message.substring(0, len);
			message = message + "...";
		}
		task.setName(message);
		task.setNote(taskInput.getText());
		task.setDueDate(new Date());
		request.updateNote(task).fire();
		tasksList.add(task);
	}
}
