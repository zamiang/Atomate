package com.listomate.server;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Task {

  private Date dueDate;
  private String emailAddress;
  

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Boolean done = Boolean.FALSE;
  private String name;
  private String userId;
  private String note;

  public Task() {
  }

  public Date getDueDate() {
    return dueDate;
  }

  public String getEmailAddress() {
    return this.emailAddress;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public Boolean isDone() {
    return done;
  }

  public String getUserId() {
    return userId;
  }
  
  public String getNote() {
	    return note;
	  }

  public void setDueDate(Date dueDate) {
    this.dueDate = dueDate;
  }

  public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public void setName(String name) {
    this.name = name;
  }
  
  public void setNote(String note) {
	    this.note = note;
	  }

  public void setDone(Boolean done) {
    this.done = done;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  @Override
  public String toString() {
    StringBuilder builder = new StringBuilder();
    builder.append("Task [dueDate=");
    builder.append(dueDate);
    builder.append(", done=");
    builder.append(done);
    builder.append(", name=");
    builder.append(name);
    builder.append("]");
    return builder.toString();
  }
}
