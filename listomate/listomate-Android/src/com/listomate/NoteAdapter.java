package com.listomate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import android.content.Context;
import android.text.format.DateFormat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import com.listomate.shared.NoteProxy;

public class NoteAdapter extends BaseAdapter {

	private final static class ViewHolder {
		TextView title;
		TextView date;
	}

	private Comparator<NoteProxy> taskComparator = new Comparator<NoteProxy>() {
		public int compare(NoteProxy object1, NoteProxy object2) {
			Date date1 = object1.getDueDate();
			Date date2 = object2.getDueDate();
			if (date1 != null) {
				if (date2 != null) {
					return date1.compareTo(date2);
				} else {
					return -1;
				}
			} else {
				if (date2 != null) {
					return 1;
				}
			}
			return 0;
		}
	};

	private final List<NoteProxy> items = new ArrayList<NoteProxy>();
	private final LayoutInflater inflater;

	private java.text.DateFormat dateFormat;

	public NoteAdapter(Context context) {
		inflater = (LayoutInflater) context
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

		dateFormat = DateFormat.getDateFormat(context);
	}

	public void setNotes(List<NoteProxy> items) {
		this.items.clear();
		this.items.addAll(items);
		Collections.sort(this.items, taskComparator);
	}

	public void addNotes(List<NoteProxy> items) {
		this.items.addAll(items);
		Collections.sort(this.items, taskComparator);
	}

	public NoteProxy get(int position) {
		return items.get(position);
	}

	public int getCount() {
		return items.size();
	}

	public Object getItem(int position) {
		return items.get(position);
	}

	public long getItemId(int position) {
		return position;
	}

	public View getView(int position, View convertView, ViewGroup view) {
		ViewHolder holder;
		if (convertView == null) {
			convertView = inflater.inflate(R.layout.listitem, null);

			holder = new ViewHolder();
			holder.title = (TextView) convertView.findViewById(R.id.taskTitle);
			holder.date = (TextView) convertView.findViewById(R.id.taskDate);
			convertView.setTag(holder);
		} else {
			holder = (ViewHolder) convertView.getTag();
		}

		NoteProxy task = items.get(position);

		holder.title.setText(task.getName());
		Date dueDate = task.getDueDate();
		if (dueDate != null) {
			holder.date.setText(dateFormat.format(dueDate));
		}

		return convertView;
	}
}
