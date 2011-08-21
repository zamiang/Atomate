package com.listomate.server;

import com.google.web.bindery.requestfactory.shared.Locator;


public class TaskLocator extends Locator<Task, Void> {

	@Override
	public Task create(Class<? extends Task> clazz) {
		return new Task();
	}

	@Override
	public Task find(Class<? extends Task> clazz, Void id) {
		return create(clazz);
	}

	@Override
	public Class<Task> getDomainType() {
		return Task.class;
	}

	@Override
	public Void getId(Task domainObject) {
		return null;
	}

	@Override
	public Class<Void> getIdType() {
		return Void.class;
	}

	@Override
	public Object getVersion(Task domainObject) {
		return null;
	}

}
